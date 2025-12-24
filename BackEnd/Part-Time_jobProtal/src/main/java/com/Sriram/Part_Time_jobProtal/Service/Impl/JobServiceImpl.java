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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;

    private JobResponse toDto(Job job) {
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
                .latitude(job.getLatitude())
                .longitude(job.getLongitude())
                .providerId(job.getProviderId())
                .createdAt(job.getCreatedAt() != null ? job.getCreatedAt().toString() : null)
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
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
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
        return jobRepository.filterJobs(
                        search == null ? null : search.trim().toLowerCase(),
                        city == null ? null : city.trim().toLowerCase(),
                        type == null ? null : type.trim().toLowerCase(),
                        salary
                )
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public ProviderJobResponse getJobWithApplicants(Long jobId, Long providerId) {

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        // ✅ PROVIDER OWNERSHIP CHECK
        if (!job.getProviderId().equals(providerId)) {
            throw new UnauthorizedException("You cannot access this job");
        }

        List<JobApplication> apps =
                applicationRepository.findByJobAndHiddenFromProviderFalse(job);

        List<ProviderApplicantDTO> applicantDTOs = apps.stream().map(app -> {

            Long chatId = app.getChatRoom() != null
                    ? app.getChatRoom().getId()
                    : null;

            Applicant applicant = app.getApplicant();

            return ProviderApplicantDTO.builder()
                    .applicationId(app.getId())
                    .applicantId(applicant.getId())
                    .userId(applicant.getUser().getId())
                    .name(applicant.getUser().getFullName())
                    .age(applicant.getAge() != null ? applicant.getAge() : 0) // ✅ NULL SAFE
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
