package com.Sriram.Part_Time_jobProtal.Service;

import com.Sriram.Part_Time_jobProtal.DTOs.AppliedJobDTO;
import com.Sriram.Part_Time_jobProtal.DTOs.ApplyJobRequest;
import com.Sriram.Part_Time_jobProtal.DTOs.ApplicationResponse;

import java.util.List;

public interface JobApplicationService {

    ApplicationResponse applyForJob(Long jobId, Long userId, ApplyJobRequest request);

    List<ApplicationResponse> getApplicationsForSeeker(Long userId);

    List<ApplicationResponse> getApplicationsForJob(Long jobId);
    ApplicationResponse providerAccept(Long applicationId);
    ApplicationResponse providerReject(Long applicationId);
    List<AppliedJobDTO> getAppliedJobsForSeeker(Long userId);

    //for withdraw request
    void withdrawApplication(Long applicationId, Long seekerId);
    void hideApplicationForSeeker(Long applicationId, Long seekerUserId);

    void hideApplicationForProvider(Long applicationId, Long providerUserId);

}
