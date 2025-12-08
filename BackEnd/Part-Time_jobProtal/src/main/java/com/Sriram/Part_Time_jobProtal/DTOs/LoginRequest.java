package com.Sriram.Part_Time_jobProtal.DTOs;


import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}