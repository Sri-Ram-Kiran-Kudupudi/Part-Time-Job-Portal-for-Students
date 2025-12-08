package com.Sriram.Part_Time_jobProtal.Service.Impl;

import com.Sriram.Part_Time_jobProtal.Config.JwtUtil;
import com.Sriram.Part_Time_jobProtal.DTOs.*;
import com.Sriram.Part_Time_jobProtal.Model.Applicant;
import com.Sriram.Part_Time_jobProtal.Model.Role;
import com.Sriram.Part_Time_jobProtal.Model.User;
import com.Sriram.Part_Time_jobProtal.Repository.ApplicantRepository;
import com.Sriram.Part_Time_jobProtal.Repository.UserRepository;
import com.Sriram.Part_Time_jobProtal.Service.AuthService;
import com.Sriram.Part_Time_jobProtal.Exception.ResourceNotFoundException;
import com.Sriram.Part_Time_jobProtal.Exception.UnauthorizedException;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final ApplicantRepository applicantRepository;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UnauthorizedException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(encoder.encode(request.getPassword()))
                .role(request.getRole())
                .age(request.getAge())
                .gender(request.getGender())
                .phone(request.getPhone())  // ✅ SAVING PHONE
                .build();

        User saved = userRepository.save(user);

        if (saved.getRole() == Role.SEEKER) {

            Applicant applicant = Applicant.builder()
                    .user(saved)
                    .age(saved.getAge())
                    .gender(saved.getGender())
                    .city(request.getCity())
                    .district(request.getDistrict())
                    .state(request.getState())
                    .skills(request.getSkills())
                    .experience(request.getExperience())
                    .status("ACTIVE")
                    .chatId(null)
                    .build();

            applicantRepository.save(applicant);
        }

        return new LoginResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole()
        );
    }

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

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
}
