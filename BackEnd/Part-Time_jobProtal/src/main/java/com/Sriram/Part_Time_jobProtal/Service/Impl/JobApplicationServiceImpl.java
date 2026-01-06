package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.DTOs.AppliedJobDTO;
import com.Sriram.Part_Time_jobProtal.DTOs.ApplyJobRequest;
import com.Sriram.Part_Time_jobProtal.DTOs.ApplicationResponse;
import com.Sriram.Part_Time_jobProtal.Model.*;
import com.Sriram.Part_Time_jobProtal.Repository.*;
import com.Sriram.Part_Time_jobProtal.Service.JobApplicationService;
import com.Sriram.Part_Time_jobProtal.Exception.AlreadyAppliedException;
import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;
import com.Sriram.Part_Time_jobProtal.Model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobRepository jobRepository;
    private final ApplicantRepository applicantRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;

    // -----------------------------------------------------------
    // APPLY FOR A JOB
    // -----------------------------------------------------------
    @Override
    public ApplicationResponse applyForJob(Long jobId, Long userId, ApplyJobRequest request) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Applicant applicant = applicantRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant profile not found"));

        if (applicationRepository.existsByApplicantAndJob(applicant, job)) {
            throw new AlreadyAppliedException("You have already applied for this job");
        }

        JobApplication app = JobApplication.builder()
                .job(job)
                .applicant(applicant)
                .seekerMessage(request.getMessage())
                .status("seeker_accepted")
                .appliedAt(LocalDateTime.now())
                .hiddenFromSeeker(false)
                .hiddenFromProvider(false)
                .build();

        JobApplication saved = applicationRepository.save(app);
        User provider = userRepository.findById(job.getProviderId()).orElse(null);

        return ApplicationResponse.fromEntity(saved, provider);
    }

    // -----------------------------------------------------------
    // SEEKER APPLIED JOB LIST
    // -----------------------------------------------------------
    @Override
    public List<ApplicationResponse> getApplicationsForSeeker(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Applicant applicant = applicantRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant profile not found"));

        return applicationRepository.findByApplicantAndHiddenFromSeekerFalse(applicant)
                .stream()
                .map(app -> {
                    User provider = userRepository.findById(app.getJob().getProviderId()).orElse(null);
                    return ApplicationResponse.fromEntity(app, provider);
                })
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------
    // PROVIDER VIEW APPLICANTS OF A JOB
    // -----------------------------------------------------------
    @Override
    public List<ApplicationResponse> getApplicationsForJob(Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        return applicationRepository.findByJobAndHiddenFromProviderFalse(job)
                .stream()
                .map(app -> {
                    User provider = userRepository.findById(job.getProviderId()).orElse(null);
                    return ApplicationResponse.fromEntity(app, provider);
                })
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------
    // PROVIDER ACCEPT
    // -----------------------------------------------------------
    @Override
    public ApplicationResponse providerAccept(Long applicationId) {

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        String status = app.getStatus();

        if ("seeker_accepted".equalsIgnoreCase(status)) {
            app.setStatus("both_accepted");

            // Create chat room only once
            if (app.getChatRoom() == null) {
                ChatRoom room = chatRoomRepository.save(
                        ChatRoom.builder().createdAt(LocalDateTime.now()).build()
                );
                app.setChatRoom(room);
            }
        } else {
            app.setStatus("provider_accepted");
        }

        JobApplication saved = applicationRepository.save(app);
        User provider = userRepository.findById(app.getJob().getProviderId()).orElse(null);

        return ApplicationResponse.fromEntity(saved, provider);
    }

    // -----------------------------------------------------------
    // PROVIDER REJECT
    // -----------------------------------------------------------
    @Override
    @Transactional
    public ApplicationResponse providerReject(Long applicationId) {

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        // Mark as rejected
        app.setStatus("rejected");

        // ❗ DO NOT hide automatically
        app.setHiddenFromSeeker(false);
        app.setHiddenFromProvider(false);

        // ❗ DO NOT delete here
        JobApplication saved = applicationRepository.save(app);

        User provider = userRepository.findById(
                saved.getJob().getProviderId()
        ).orElse(null);

        return ApplicationResponse.fromEntity(saved, provider);
    }


    // -----------------------------------------------------------
    // SEEKER APPLIED JOB LIST (CARD VIEW)
    // -----------------------------------------------------------
    @Override
    public List<AppliedJobDTO> getAppliedJobsForSeeker(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Applicant applicant = applicantRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant profile not found"));

        return applicationRepository.findByApplicantAndHiddenFromSeekerFalse(applicant)
                .stream()
                .map(app -> {

                    User provider = userRepository.findById(app.getJob().getProviderId()).orElse(null);

                    Long chatId = app.getChatRoom() != null ? app.getChatRoom().getId() : null;

                    return AppliedJobDTO.builder()
                            .applicationId(app.getId())
                            .jobId(app.getJob().getId())
                            .title(app.getJob().getTitle())
                            .type(app.getJob().getType())
                            .salary(app.getJob().getSalary())
                            .location(app.getJob().getAddress())
                            .providerName(provider != null ? provider.getFullName() : "Provider")
                            .status(app.getStatus())
                            .chatId(chatId)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------
    // WITHDRAW (only if not accepted)
    // -----------------------------------------------------------
    @Override
    public void withdrawApplication(Long applicationId, Long seekerId) {

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getApplicant().getUser().getId().equals(seekerId)) {
            throw new RuntimeException("Unauthorized delete attempt");
        }

        if (app.getStatus().equalsIgnoreCase("both_accepted")
                || app.getStatus().equalsIgnoreCase("rejected")) {
            throw new RuntimeException("Cannot withdraw after acceptance or rejection");
        }

        applicationRepository.delete(app);
    }

    // -----------------------------------------------------------
    // SEEKER HIDE
    // -----------------------------------------------------------
    @Override
    @Transactional
    public void hideApplicationForSeeker(Long applicationId, Long seekerUserId) {

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getApplicant().getUser().getId().equals(seekerUserId)) {
            throw new RuntimeException("Unauthorized");
        }

        // ✅ CORRECT CONDITION
        if (!app.getStatus().equalsIgnoreCase("both_accepted")
                && !app.getStatus().equalsIgnoreCase("rejected")) {
            throw new RuntimeException("Cannot remove — job not completed yet");
        }

        app.setHiddenFromSeeker(true);
        applicationRepository.save(app);

        if (app.isHiddenFromProvider()) {
            cleanupApplication(app);
        }
    }


    // -----------------------------------------------------------
    // PROVIDER HIDE
    // -----------------------------------------------------------
    @Override
    @Transactional
    public void hideApplicationForProvider(Long applicationId, Long providerUserId) {

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getJob().getProviderId().equals(providerUserId)) {
            throw new RuntimeException("Unauthorized");
        }

        // ✅ CORRECT CONDITION
        if (!app.getStatus().equalsIgnoreCase("both_accepted")
                && !app.getStatus().equalsIgnoreCase("rejected")) {
            throw new RuntimeException("Cannot remove — job not completed yet");
        }

        app.setHiddenFromProvider(true);
        applicationRepository.save(app);

        if (app.isHiddenFromSeeker()) {
            cleanupApplication(app);
        }
    }


    // -----------------------------------------------------------
    // CLEANUP (DELETE application + cascade deletes chat)
    // -----------------------------------------------------------
    @Transactional
    protected void cleanupApplication(JobApplication app) {

        JobApplication fresh = applicationRepository.findById(app.getId()).orElse(null);
        if (fresh == null) return;

        applicationRepository.delete(fresh); // Cascade deletes chatRoom automatically
    }
}
