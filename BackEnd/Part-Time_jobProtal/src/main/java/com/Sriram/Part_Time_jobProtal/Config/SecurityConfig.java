package com.Sriram.Part_Time_jobProtal.Config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final AppUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfig()))

                .authorizeHttpRequests(auth -> auth

                        // PUBLIC ROUTES
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/404",
                                "/error",
                                "/ws/**"
                        ).permitAll()

                        // PUBLIC — Only job listing
                        .requestMatchers("/api/jobs", "/api/jobs/all").permitAll()

                        // SEEKER ONLY
                        .requestMatchers("/api/jobs/applied").hasRole("SEEKER")
                        .requestMatchers("/api/jobs/*/apply").hasRole("SEEKER")
                        .requestMatchers("/api/jobs/applications/*/hide/seeker").hasRole("SEEKER")

                        // PROVIDER ONLY
                        .requestMatchers("/api/jobs/applications/*/accept").hasRole("PROVIDER")
                        .requestMatchers("/api/jobs/applications/*/reject").hasRole("PROVIDER")
                        .requestMatchers("/api/jobs/applications/*/hide/provider").hasRole("PROVIDER")

                        // CHAT
                        .requestMatchers("/api/chat/**").hasAnyRole("SEEKER", "PROVIDER")

                        // SEEKER MODULE
                        .requestMatchers("/api/seeker/**").hasRole("SEEKER")

                        // PROVIDER MODULE
                        .requestMatchers("/api/provider/**").hasRole("PROVIDER")

                        // ADMIN MODULE
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Applicant profile access
                        .requestMatchers("/api/applicant/**")
                        .hasAnyRole("SEEKER", "PROVIDER", "ADMIN")

                        .anyRequest().authenticated()
                )


                .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtEntryPoint))

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfig() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        c.addAllowedHeader("*");
        c.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);
        return src;
    }

    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(encoder());
        return new ProviderManager(provider);
    }
}
