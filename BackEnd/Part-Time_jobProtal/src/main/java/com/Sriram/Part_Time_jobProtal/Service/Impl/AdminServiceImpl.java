package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.DTOs.AdminApplicationRecord;
import com.Sriram.Part_Time_jobProtal.DTOs.ProviderResponse;
import com.Sriram.Part_Time_jobProtal.DTOs.SeekerResponse;
import com.Sriram.Part_Time_jobProtal.Exception.ConflictException;
import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;
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
        return applicantRepo.findAll()  //for converting to list uses streams
                .stream()
                .map(a -> new SeekerResponse(  //here we find the applicant then from that using we getUser() and do the oprations
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

        boolean hasActive =
                applicationRepo.existsByApplicant_User_IdAndStatusAndHiddenFromSeekerFalse( //Check whether there exists a record where the applicant’s user id matches, status matches, and it is not hidden from the seeker.
                        userId, "both_accepted"
                );

        if (hasActive) {
            throw new ConflictException("Cannot delete seeker: active accepted job exists.");
        }

        Applicant applicant = applicantRepo.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));


        //  delete chats first
        List<Long> roomIds =
                applicationRepo.findChatRoomIdsByApplicantUserId(userId);

        for (Long roomId : roomIds) {
            //order matters like delete msgs first then chat room
            chatMessageRepository.deleteByChatRoom_Id(roomId);
            chatRoomRepository.deleteById(roomId);
        }

        //  delete from  job applications
        applicationRepo.deleteByApplicant_Id(applicant.getId()); //Removes all applications of seeke

        // delete applicant + user (cascade)
        applicantRepo.delete(applicant);
    }

    //     DELETE PROVIDER LOGIC
    @Override
    @Transactional
    public void deleteProvider(Long providerId) {

        // 1️ Check Provider Exists
        User provider = userRepo.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        // 2️ Check Active Accepted Jobs
        boolean hasActiveApplications =
                applicationRepo.existsByJob_ProviderIdAndStatusAndHiddenFromProviderFalse(  //It checks: If any application exists where job.providerId = providerId status = "both_accepted" hiddenFromProvider = false
                        providerId, "both_accepted"
                );
        if (hasActiveApplications) {
            throw new ConflictException("Cannot delete provider: He active accepted job exists.");
        }

        // 3️ Get All Jobs of Provider
        List<Job> jobs = jobRepo.findByProviderId(providerId);

        for (Job job : jobs) {

            // Get chat rooms for each job
            List<Long> roomIds = applicationRepo.findChatRoomIdsByJobId(job.getId());

            for (Long roomId : roomIds) {
                if (roomId != null) {
                    chatMessageRepository.deleteByChatRoom_Id(roomId);
                    chatRoomRepository.deleteById(roomId);
                }
            }

            // Delete from applications of this job
            applicationRepo.deleteByJob_Id(job.getId());
        }

        // 4️ Delete provider Jobs
        jobRepo.deleteByProviderId(providerId); //Deletes all jobs belonging to provider.

        // 5️ Finally Delete Provider
        userRepo.delete(provider);
    }
//This method safely deletes a service provider from the system.
//First it verifies the provider exists and ensures they don’t have any active accepted jobs.
// If active jobs exist, it throws a conflict exception. Otherwise, it retrieves all jobs posted by the provider,
// deletes related chat rooms, chat messages, and job applications, then deletes all jobs, and finally deletes the provider.
// The whole process is wrapped in a @Transactional block to ensure data integrity and rollback on failure.

    //   ADMIN APPLICATION RECORDS
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
                            job.getAddress(),
                            seeker.getFullName(),
                            seeker.getEmail(),
                            seeker.getPhone(),
                            a.getStatus()
                    );
                }).toList();
    }
   //This method fetches all job applications from the database and
    // converts each application into a custom DTO called AdminApplicationRecord.
    // For every application, it collects related information like job details, job seeker details,
    // and provider details, then returns the complete list for admin to view in a neat structured format.
    // It uses Java Streams and mapping to transform entity objects into response objects efficiently.
}
