package com.Sriram.Part_Time_jobProtal.Controller;

import com.Sriram.Part_Time_jobProtal.DTOs.*;
import com.Sriram.Part_Time_jobProtal.Service.AuthService;
import com.Sriram.Part_Time_jobProtal.Util.OtpUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.Sriram.Part_Time_jobProtal.Model.EmailOtp;
import com.Sriram.Part_Time_jobProtal.Model.User;
import com.Sriram.Part_Time_jobProtal.Repository.EmailOtpRepository;
import com.Sriram.Part_Time_jobProtal.Repository.UserRepository;
import com.Sriram.Part_Time_jobProtal.Exception.UnauthorizedException;
import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailOtpRepository emailOtpRepository;
    private final UserRepository userRepository;

    // REGISTER → returns normal LoginResponse (NO TOKEN here)
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // LOGIN → returns JwtResponse (TOKEN + USER DETAILS)
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    @Transactional
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody Map<String, String> request) { //Map helps quickly read of email and otp

        String email = request.get("email");
        String otp = request.get("otp");

        EmailOtp savedOtp = emailOtpRepository
                .findTopByEmailOrderByIdDesc(email) //Gets most recent OTP or  Find OTP row with this email Order by id descending (latest first) Pick top 1
                .orElseThrow(() -> new UnauthorizedException("OTP not found"));

        if (savedOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
           // If expiresAt is BEFORE current time → OTP expired
            throw new UnauthorizedException("OTP expired");
        }

        if (!savedOtp.getOtp().equals(otp)) {
            throw new UnauthorizedException("Invalid OTP");
        }

        User user = userRepository.findByEmail(email)  //you save user at register page but enabled=false
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEnabled(true); //User can now login and Account is activated
        userRepository.save(user);

        // safer cleanup
        emailOtpRepository.deleteByEmail(email);//OTP should not be reused so deleted once used

        return ResponseEntity.ok("Email verified successfully");
    }


    @Transactional
    @PostMapping("/resend-otp") //for sending the otp i uses the post
    public ResponseEntity<String> resendOtp(@RequestBody Map<String, String> request) {

        String email = request.get("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isEnabled()) {
            throw new UnauthorizedException("Email already verified");
        }

        // deleting the old otp,
        emailOtpRepository.deleteByEmail(email);

        String otp = OtpUtil.generateOtp();

        EmailOtp emailOtp = EmailOtp.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(2))
                .build();

        emailOtpRepository.save(emailOtp);

        authService.sendOtpEmail(email, otp);

        return ResponseEntity.ok("OTP resent successfully");
    }


}
// if you uses @RequiredArgsConstructor
//then Lombok automatically creates a constructor for final fields.