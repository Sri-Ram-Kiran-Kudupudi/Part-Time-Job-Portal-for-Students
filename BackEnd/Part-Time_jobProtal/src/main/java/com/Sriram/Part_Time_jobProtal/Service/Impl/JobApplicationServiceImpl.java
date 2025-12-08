package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.DTOs.AppliedJobDTO;
import com.Sriram.Part_Time_jobProtal.DTOs.ApplyJobRequest;
import com.Sriram.Part_Time_jobProtal.DTOs.ApplicationResponse;
import com.Sriram.Part_Time_jobProtal.Model.*;
import com.Sriram.Part_Time_jobProtal.Repository.*;
import com.Sriram.Part_Time_jobProtal.Service.JobApplicationService;
import com.Sriram.Part_Time_jobProtal.Exception.AlreadyAppliedException;
import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
                .build();

        JobApplication saved = applicationRepository.save(app);
        User provider = userRepository.findById(job.getProviderId()).orElse(null);

        return ApplicationResponse.fromEntity(saved, provider);
    }

    @Override
    public List<ApplicationResponse> getApplicationsForSeeker(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Applicant applicant = applicantRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant profile not found"));

        return applicationRepository.findByApplicant(applicant)
                .stream()
                .map(app -> {
                    User provider = userRepository.findById(app.getJob().getProviderId()).orElse(null);
                    return ApplicationResponse.fromEntity(app, provider);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<ApplicationResponse> getApplicationsForJob(Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        return applicationRepository.findByJob(job)
                .stream()
                .map(app -> {
                    User provider = userRepository.findById(job.getProviderId()).orElse(null);
                    return ApplicationResponse.fromEntity(app, provider);
                })
                .collect(Collectors.toList());
    }

    // ⭐⭐⭐ FIXED STATUS FLOW: PROVIDER ACCEPT ⭐⭐⭐
    @Override
    public ApplicationResponse providerAccept(Long applicationId) {

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        String current = app.getStatus();

        if (current.equals("seeker_accepted")) {

            // ⭐ NOW FINAL MATCH
            app.setStatus("both_accepted");

            // Create chat room ONLY once
            if (app.getChatRoom() == null) {
                ChatRoom room = chatRoomRepository.save(
                        ChatRoom.builder()
                                .createdAt(LocalDateTime.now())
                                .build()
                );
                app.setChatRoom(room);
            }

        } else if (current.equals("provider_accepted")) {
            // already accepted by provider → no change
            app.setStatus("provider_accepted");

        } else {
            // Seeker has NOT accepted yet
            app.setStatus("provider_accepted");
        }

        JobApplication saved = applicationRepository.save(app);
        User provider = userRepository.findById(app.getJob().getProviderId()).orElse(null);

        return ApplicationResponse.fromEntity(saved, provider);
    }

    @Override
    public ApplicationResponse providerReject(Long applicationId) {

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        app.setStatus("rejected");
        JobApplication saved = applicationRepository.save(app);

        User provider = userRepository.findById(app.getJob().getProviderId()).orElse(null);

        return ApplicationResponse.fromEntity(saved, provider);
    }

    @Override
    public List<AppliedJobDTO> getAppliedJobsForSeeker(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Applicant applicant = applicantRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant profile not found"));

        return applicationRepository.findByApplicant(applicant)
                .stream()
                .map(app -> {

                    User provider = userRepository.findById(app.getJob().getProviderId()).orElse(null);

                    Long chatId = (app.getChatRoom() != null)
                            ? app.getChatRoom().getId()
                            : null;

                    return AppliedJobDTO.builder()
                            .applicationId(app.getId())
                            .jobId(app.getJob().getId())
                            .title(app.getJob().getTitle())
                            .type(app.getJob().getType())
                            .salary(app.getJob().getSalary())
                            .location(app.getJob().getCity())
                            .providerName(provider != null ? provider.getFullName() : "Provider")
                            .status(app.getStatus())
                            .chatId(chatId)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public void withdrawApplication(Long applicationId, Long seekerId) {

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!app.getApplicant().getUser().getId().equals(seekerId)) {
            throw new RuntimeException("Unauthorized delete attempt");
        }

        String status = app.getStatus().toLowerCase();

        if (status.equals("both_accepted") || status.equals("rejected")) {
            throw new RuntimeException("Cannot withdraw after acceptance or rejection");
        }

        applicationRepository.delete(app);
    }
}
