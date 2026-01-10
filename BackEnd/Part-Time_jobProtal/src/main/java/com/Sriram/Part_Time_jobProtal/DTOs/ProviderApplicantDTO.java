package com.Sriram.Part_Time_jobProtal.DTOs;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProviderApplicantDTO {
    private Long applicationId;
    private Long applicantId;
    private Long userId;
    private String name;
    private int age;
    private String status;
    private Long chatId;
}
//this class is usefull for the provider specifc job info in jobService