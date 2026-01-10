package com.Sriram.Part_Time_jobProtal.DTOs;

import lombok.*;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobResponse {
    private Long id;
    private String title;
    private String type;
    private String timing;
    private String salary;
    private String description;

    private String address;
    private Double latitude;
    private Double longitude;

    private Long providerId;
    private String createdAt;
}
