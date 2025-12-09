package com.Sriram.Part_Time_jobProtal.Service;

import com.Sriram.Part_Time_jobProtal.DTOs.JobRequest;
import com.Sriram.Part_Time_jobProtal.DTOs.JobResponse;
import com.Sriram.Part_Time_jobProtal.DTOs.ProviderJobResponse;

import java.util.List;

public interface JobService {

    Object createJob(JobRequest request, Long providerId);

    List<JobResponse> getJobsByProvider(Long providerId);

    Object updateJob(Long jobId, JobRequest request, Long providerId);

    void deleteJob(Long jobId, Long providerId);

    JobResponse getJobById(Long id);

    List<JobResponse> getAllJobs(String search, String city, String type, String salary);

    // ⭐ provider sees applicants
    ProviderJobResponse getJobWithApplicants(Long jobId);

}
