package com.Sriram.Part_Time_jobProtal.DTOs;

import com.Sriram.Part_Time_jobProtal.Model.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String fullName;
    private String email;
    private String password;
    private Role role;

    private Integer age;
    private String gender;
    private String phone;  // ✅ NEW FIELD

    private String city;
    private String district;
    private String state;
    private String skills;
    private String experience;
}
