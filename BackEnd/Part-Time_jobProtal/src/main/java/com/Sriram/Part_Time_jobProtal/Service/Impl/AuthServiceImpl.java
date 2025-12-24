package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.Config.JwtUtil;
import com.Sriram.Part_Time_jobProtal.DTOs.JwtResponse;
import com.Sriram.Part_Time_jobProtal.DTOs.LoginRequest;
import com.Sriram.Part_Time_jobProtal.DTOs.LoginResponse;
import com.Sriram.Part_Time_jobProtal.DTOs.RegisterRequest;
import com.Sriram.Part_Time_jobProtal.Exception.ConflictException;
import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;
import com.Sriram.Part_Time_jobProtal.Exception.UnauthorizedException;
import com.Sriram.Part_Time_jobProtal.Model.Applicant;
import com.Sriram.Part_Time_jobProtal.Model.EmailOtp;
import com.Sriram.Part_Time_jobProtal.Model.Role;
import com.Sriram.Part_Time_jobProtal.Model.User;
import com.Sriram.Part_Time_jobProtal.Repository.ApplicantRepository;
import com.Sriram.Part_Time_jobProtal.Repository.EmailOtpRepository;
import com.Sriram.Part_Time_jobProtal.Repository.UserRepository;
import com.Sriram.Part_Time_jobProtal.Service.AuthService;
import com.Sriram.Part_Time_jobProtal.Service.EmailService;
import com.Sriram.Part_Time_jobProtal.Util.OtpUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final int OTP_EXPIRY_MINUTES = 2;

    private final UserRepository userRepository;
    private final ApplicantRepository applicantRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    // ========================= LOGIN =========================
    @Override
    public JwtResponse login(LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Email not verified. Please verify OTP.");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                "ROLE_" + user.getRole().name(),
                user.getId()
        );

        return new JwtResponse(
                user.getId(),
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getPhone()
        );
    }

    // ========================= REGISTER =========================
    @Transactional
    @Override
    public LoginResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User existingUser = userRepository.findByEmail(email).orElse(null);

        // 🔴 CASE 1: Email already verified
        if (existingUser != null && existingUser.isEnabled()) {
            throw new ConflictException("Email already exists");
        }

        // 🔁 CASE 2: Email exists but NOT verified → clean old data
        if (existingUser != null) {
            emailOtpRepository.deleteByEmail(email);
            applicantRepository.deleteByUser_Id(existingUser.getId());
            userRepository.delete(existingUser);
            userRepository.flush();
        }

        // ✅ Create new user
        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .enabled(false)
                .build();

        User savedUser = userRepository.save(user);

        // ✅ Create applicant profile for SEEKER
        if (savedUser.getRole() == Role.SEEKER) {
            applicantRepository.save(
                    Applicant.builder()
                            .user(savedUser)
                            .status("ACTIVE")
                            .build()
            );
        }

        // ================= OTP CREATION =================
        String otp = OtpUtil.generateOtp();

        // 🧹 Always delete old OTP
        emailOtpRepository.deleteByEmail(email);

        emailOtpRepository.save(
                EmailOtp.builder()
                        .email(email)
                        .otp(otp)
                        .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                        .build()
        );

        sendOtpEmail(email, otp);

        return new LoginResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    // ========================= SEND OTP EMAIL =========================
    public void sendOtpEmail(String email, String otp) {
        try {
            emailService.sendOtp(email, otp);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email");
        }
    }
}
