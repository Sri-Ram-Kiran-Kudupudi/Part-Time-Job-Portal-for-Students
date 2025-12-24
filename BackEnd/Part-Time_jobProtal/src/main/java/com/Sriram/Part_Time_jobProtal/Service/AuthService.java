package com.Sriram.Part_Time_jobProtal.Service;

import com.Sriram.Part_Time_jobProtal.DTOs.JwtResponse;
import com.Sriram.Part_Time_jobProtal.DTOs.LoginRequest;
import com.Sriram.Part_Time_jobProtal.DTOs.RegisterRequest;
import com.Sriram.Part_Time_jobProtal.DTOs.LoginResponse;

public interface AuthService {

    LoginResponse register(RegisterRequest request);

    JwtResponse login(LoginRequest request);
    void sendOtpEmail(String email, String otp);
}
