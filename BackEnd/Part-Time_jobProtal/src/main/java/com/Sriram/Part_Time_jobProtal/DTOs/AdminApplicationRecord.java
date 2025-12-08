package com.Sriram.Part_Time_jobProtal.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminApplicationRecord {

    private Long id;

    private String providerName;
    private String providerEmail;
    private String providerPhone;

    private String jobName;
    private String jobType;
    private String timing;
    private String category;

    private String seekerName;
    private String seekerEmail;
    private String seekerPhone;

    private String status;
}
