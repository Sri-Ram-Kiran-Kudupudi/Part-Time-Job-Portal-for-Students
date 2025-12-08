package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.DTOs.JobRequest;
import com.Sriram.Part_Time_jobProtal.DTOs.JobResponse;
import com.Sriram.Part_Time_jobProtal.DTOs.ProviderApplicantDTO;
import com.Sriram.Part_Time_jobProtal.DTOs.ProviderJobResponse;
import com.Sriram.Part_Time_jobProtal.Model.Applicant;
import com.Sriram.Part_Time_jobProtal.Model.Job;
import com.Sriram.Part_Time_jobProtal.Model.JobApplication;
import com.Sriram.Part_Time_jobProtal.Repository.JobRepository;
import com.Sriram.Part_Time_jobProtal.Repository.JobApplicationRepository;
import com.Sriram.Part_Time_jobProtal.Service.JobService;
import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;
import com.Sriram.Part_Time_jobProtal.Exception.UnauthorizedException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;

    private JobResponse toDto(Job job) {
        String createdAtStr = null;
        if (job.getCreatedAt() != null) {
            createdAtStr = job.getCreatedAt().toString();
        }
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .type(job.getType())
                .timing(job.getTiming())
                .salary(job.getSalary())
                .description(job.getDescription())
                .city(job.getCity())
                .district(job.getDistrict())
                .state(job.getState())
                .latitude(job.getLatitude())     // ⭐ NEW
                .longitude(job.getLongitude())   // ⭐ NEW
                .providerId(job.getProviderId())
                .createdAt(createdAtStr)
                .build();

    }

    @Override
    public Object createJob(JobRequest req, Long providerId) {

        Job job = Job.builder()
                .title(req.getTitle())
                .type(req.getType())
                .timing(req.getTiming())
                .salary(req.getSalary())
                .description(req.getDescription())
                .city(req.getCity())
                .district(req.getDistrict())
                .state(req.getState())
                .latitude(req.getLatitude())    // ⭐ NEW
                .longitude(req.getLongitude())  // ⭐ NEW
                .providerId(providerId)
                .build();


        return toDto(jobRepository.save(job));
    }

    @Override
    public List<JobResponse> getJobsByProvider(Long providerId) {
        return jobRepository.findByProviderId(providerId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        return toDto(job);
    }

    @Override
    public Object updateJob(Long jobId, JobRequest req, Long providerId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getProviderId().equals(providerId)) {
            throw new UnauthorizedException("You cannot modify this job");
        }

        job.setTitle(req.getTitle());
        job.setType(req.getType());
        job.setTiming(req.getTiming());
        job.setSalary(req.getSalary());
        job.setDescription(req.getDescription());
        job.setCity(req.getCity());
        job.setDistrict(req.getDistrict());
        job.setState(req.getState());
        job.setLatitude(req.getLatitude());
        job.setLongitude(req.getLongitude());


        return toDto(jobRepository.save(job));
    }

    @Override
    public void deleteJob(Long jobId, Long providerId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getProviderId().equals(providerId)) {
            throw new UnauthorizedException("You cannot delete this job");
        }

        jobRepository.delete(job);
    }

    @Override
    public List<JobResponse> getAllJobs(String search, String city, String type, String salary) {
        List<Job> jobs = jobRepository.filterJobs(
                search == null ? null : search.trim().toLowerCase(),
                city == null ? null : city.trim().toLowerCase(),
                type == null ? null : type.trim().toLowerCase(),
                salary
        );

        return jobs.stream().map(this::toDto).collect(Collectors.toList());
    }

    // ⭐⭐⭐ UPDATED: PROVIDER NOW RECEIVES chatId
    @Override
    public ProviderJobResponse getJobWithApplicants(Long jobId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        List<JobApplication> apps = applicationRepository.findByJob(job);

        List<ProviderApplicantDTO> applicantDTOs = apps.stream().map(app -> {
            Applicant ap = app.getApplicant();

            Long chatId = null;
            if (app.getChatRoom() != null) {
                chatId = app.getChatRoom().getId();
            }

            return ProviderApplicantDTO.builder()
                    .applicationId(app.getId())
                    .applicantId(ap.getId())              // applicant table ID
                    .userId(ap.getUser().getId())         // ⭐ NEW — user table ID
                    .name(ap.getUser().getFullName())
                    .age(ap.getAge())
                    .status(app.getStatus())
                    .chatId(chatId)
                    .build();
        }).toList();

        return ProviderJobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .type(job.getType())
                .timing(job.getTiming())
                .salary(job.getSalary())
                .description(job.getDescription())
                .city(job.getCity())
                .district(job.getDistrict())
                .state(job.getState())
                .applicants(applicantDTOs)
                .build();
    }

}
