package com.Sriram.Part_Time_jobProtal.DTOs;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AppliedJobDTO {
    private Long applicationId;
    private Long jobId;
    private String title;
    private String type;
    private String salary;
    private String location;
    private String providerName;
    private String status;
    private Long chatId; // <-- added
}
