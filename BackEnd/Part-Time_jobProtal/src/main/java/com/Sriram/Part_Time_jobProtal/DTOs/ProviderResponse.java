package com.Sriram.Part_Time_jobProtal.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProviderResponse {
    private Long id;
    private String fullName;
    private String email;
    private Integer age;
    private String gender;
}
