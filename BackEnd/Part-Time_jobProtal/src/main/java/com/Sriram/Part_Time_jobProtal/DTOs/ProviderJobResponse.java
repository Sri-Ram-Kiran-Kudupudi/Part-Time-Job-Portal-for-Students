package com.Sriram.Part_Time_jobProtal.DTOs;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProviderJobResponse {

    private Long id;
    private String title;
    private String type;
    private String timing;
    private String salary;
    private String description;
    private String city;
    private String district;
    private String state;

    private List<ProviderApplicantDTO> applicants;
}
