package com.Sriram.Part_Time_jobProtal.DTOs;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProviderApplicantDTO {
    private Long applicationId;
    private Long applicantId;  // Applicant table id
    private Long userId;       // User table id  ⭐ ADD THIS
    private String name;
    private int age;
    private String status;
    private Long chatId;
}
