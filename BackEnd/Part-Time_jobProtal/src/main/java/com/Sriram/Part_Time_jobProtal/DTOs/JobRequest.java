package com.Sriram.Part_Time_jobProtal.DTOs;

import lombok.Data;

@Data
public class JobRequest {
    private String title;
    private String type;
    private String timing;
    private String salary;
    private String description;

    private String city;
    private String district;
    private String state;

    private Double latitude;   // ⭐ NEW
    private Double longitude;  // ⭐ NEW
}
