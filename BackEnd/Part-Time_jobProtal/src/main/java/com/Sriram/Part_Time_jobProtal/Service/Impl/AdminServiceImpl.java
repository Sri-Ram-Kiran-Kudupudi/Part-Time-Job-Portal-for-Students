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
    @Transactional
    public void deleteSeeker(Long userId) {

        // ❌ BLOCK ONLY IF fully accepted
        boolean fullyAccepted =
                applicationRepo.existsByApplicant_User_IdAndStatus(userId, "both_accepted");

        if (fullyAccepted) {
            throw new RuntimeException("Cannot delete seeker: job is fully accepted by both.");
        }

        try {
            // 1️⃣ delete chat rooms
            List<Long> roomIds = applicationRepo.findChatRoomIdsByApplicantUserId(userId);

            for (Long roomId : roomIds) {
                chatMessageRepository.deleteByChatRoom_Id(roomId);
                chatRoomRepository.deleteById(roomId);
            }

            // 2️⃣ delete ALL job applications for this seeker (any status allowed)
            applicationRepo.deleteByApplicant_User_Id(userId);

            // 3️⃣ delete applicant row
            applicantRepo.deleteByUser_Id(userId);

            // 4️⃣ finally delete user
            userRepo.deleteById(userId);

        } catch (Exception e) {
            throw new RuntimeException("Cannot delete seeker due to leftover application links.");
        }
    }

    // ==============================
    //     DELETE PROVIDER LOGIC
    // ==============================
    @Override
    @Transactional
    public void deleteProvider(Long providerId) {

        boolean fullyAccepted =
                applicationRepo.existsByJob_ProviderIdAndStatus(providerId, "both_accepted");

        if (fullyAccepted) {
            throw new RuntimeException("Cannot delete provider: job fully accepted by both.");
        }

        try {
            List<Job> jobs = jobRepo.findByProviderId(providerId);

            for (Job job : jobs) {
                List<Long> roomIds = applicationRepo.findChatRoomIdsByJobId(job.getId());

                for (Long roomId : roomIds) {
                    chatMessageRepository.deleteByChatRoom_Id(roomId);
                    chatRoomRepository.deleteById(roomId);
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
