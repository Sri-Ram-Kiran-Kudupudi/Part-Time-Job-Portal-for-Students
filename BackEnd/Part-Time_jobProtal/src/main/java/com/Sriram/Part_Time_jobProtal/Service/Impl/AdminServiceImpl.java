package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.DTOs.AdminApplicationRecord;
import com.Sriram.Part_Time_jobProtal.DTOs.ProviderResponse;
import com.Sriram.Part_Time_jobProtal.DTOs.SeekerResponse;
import com.Sriram.Part_Time_jobProtal.Model.*;
import com.Sriram.Part_Time_jobProtal.Repository.*;
import com.Sriram.Part_Time_jobProtal.Service.AdminService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepo;
    private final ApplicantRepository applicantRepo;
    private final JobApplicationRepository applicationRepo;
    private final JobRepository jobRepo;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    public List<SeekerResponse> getAllSeekers() {
        return applicantRepo.findAll()
                .stream()
                .map(a -> new SeekerResponse(
                        a.getUser().getId(),
                        a.getUser().getFullName(),
                        a.getUser().getEmail(),
                        a.getAge(),
                        a.getGender(),
                        a.getCity()
                )).toList();
    }

    @Override
    public List<ProviderResponse> getAllProviders() {
        return userRepo.findByRole(Role.PROVIDER)
                .stream()
                .map(p -> new ProviderResponse(
                        p.getId(),
                        p.getFullName(),
                        p.getEmail(),
                        p.getAge(),
                        p.getGender()
                )).toList();
    }

    // ==============================
    //       DELETE SEEKER LOGIC
    // ==============================
    @Override
    @jakarta.transaction.Transactional
    public void deleteSeeker(Long userId) {

        boolean hasActive =
                applicationRepo.existsByApplicant_User_IdAndStatusAndHiddenFromSeekerFalse(
                        userId, "both_accepted"
                );

        if (hasActive) {
            throw new RuntimeException("Cannot delete seeker: active accepted job exists.");
        }

        Applicant applicant = applicantRepo.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        // 🔥 delete chats first
        List<Long> roomIds =
                applicationRepo.findChatRoomIdsByApplicantUserId(userId);

        for (Long roomId : roomIds) {
            chatMessageRepository.deleteByChatRoom_Id(roomId);
            chatRoomRepository.deleteById(roomId);
        }

        // 🔥 delete job applications
        applicationRepo.deleteByApplicant_Id(applicant.getId());

        // 🔥 delete applicant + user (cascade)
        applicantRepo.delete(applicant);
    }



    // ==============================
    //     DELETE PROVIDER LOGIC
    // ==============================
    @Override
    @Transactional
    public void deleteProvider(Long providerId) {

        boolean hasActiveApplications =
                applicationRepo.existsByJob_ProviderIdAndStatusAndHiddenFromProviderFalse(
                        providerId, "both_accepted"
                );

        if (hasActiveApplications) {
            throw new RuntimeException(
                    "Cannot delete provider: active accepted job exists."
            );
        }



        try {
            List<Job> jobs = jobRepo.findByProviderId(providerId);

            for (Job job : jobs) {
                List<Long> roomIds = applicationRepo.findChatRoomIdsByJobId(job.getId());

                for (Long roomId : roomIds) {
                    if (roomId != null) {
                        chatMessageRepository.deleteByChatRoom_Id(roomId);
                        chatRoomRepository.deleteById(roomId);
                    }
                }


                applicationRepo.deleteByJob_Id(job.getId());
            }

            jobRepo.deleteByProviderId(providerId);
            userRepo.deleteById(providerId);

        } catch (Exception e) {
            throw new RuntimeException("Cannot delete provider due to active chats or applications.");
        }
    }


    // ==============================
    //   ADMIN APPLICATION RECORDS
    // ==============================
    @Override
    public List<AdminApplicationRecord> getAllApplicationRecords() {
        return applicationRepo.findAll()
                .stream()
                .map(a -> {
                    User seeker = a.getApplicant().getUser();
                    Job job = a.getJob();
                    User provider = userRepo.findById(job.getProviderId()).orElse(null);

                    return new AdminApplicationRecord(
                            a.getId(),
                            provider != null ? provider.getFullName() : null,
                            provider != null ? provider.getEmail() : null,
                            provider != null ? provider.getPhone() : null,
                            job.getTitle(),
                            job.getType(),
                            job.getTiming(),
                            job.getDistrict(),
                            seeker.getFullName(),
                            seeker.getEmail(),
                            seeker.getPhone(),
                            a.getStatus()
                    );
                }).toList();
    }

}
