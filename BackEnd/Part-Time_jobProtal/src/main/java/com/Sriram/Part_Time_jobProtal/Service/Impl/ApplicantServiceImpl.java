package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.DTOs.ApplicantDTO;
import com.Sriram.Part_Time_jobProtal.Model.Applicant;
import com.Sriram.Part_Time_jobProtal.Repository.ApplicantRepository;
import com.Sriram.Part_Time_jobProtal.Service.ApplicantService;
import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApplicantServiceImpl implements ApplicantService {

    private final ApplicantRepository applicantRepository;

    @Override
    public ApplicantDTO getApplicantById(Long userId) {

        Applicant applicant = applicantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));

        return new ApplicantDTO(applicant);
    }
}
