package com.Sriram.Part_Time_jobProtal.DTOs;

import com.Sriram.Part_Time_jobProtal.Model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
}
