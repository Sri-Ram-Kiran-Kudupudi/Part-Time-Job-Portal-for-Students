package com.Sriram.Part_Time_jobProtal.Controller;

import com.Sriram.Part_Time_jobProtal.DTOs.ApplicantDTO;
import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;
import com.Sriram.Part_Time_jobProtal.Model.Applicant;
import com.Sriram.Part_Time_jobProtal.Repository.ApplicantRepository;
import com.Sriram.Part_Time_jobProtal.Service.ApplicantService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applicant")
@RequiredArgsConstructor
public class ApplicantController {

    private final ApplicantService applicantService;
    private final ApplicantRepository applicantRepository;

    // ⭐ Get applicant profile using USER ID
    @GetMapping("/{userId}")
    public ResponseEntity<ApplicantDTO> getApplicant(@PathVariable Long userId) {
        return ResponseEntity.ok(applicantService.getApplicantById(userId));
    }

    // ⭐ Update seeker profile using USER ID
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateApplicant(
            @PathVariable Long userId,
            @RequestBody Applicant updated
    ) {
        Applicant applicant = applicantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Applicant not found"));

        applicant.setAge(updated.getAge());
        applicant.setGender(updated.getGender());
        applicant.setCity(updated.getCity());
        applicant.setDistrict(updated.getDistrict());
        applicant.setState(updated.getState());
        applicant.setSkills(updated.getSkills());
        applicant.setExperience(updated.getExperience());

        applicantRepository.save(applicant);
        return ResponseEntity.ok("Applicant updated");
    }
}
