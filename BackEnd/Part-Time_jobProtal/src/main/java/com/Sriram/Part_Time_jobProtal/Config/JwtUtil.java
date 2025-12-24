package com.Sriram.Part_Time_jobProtal.Config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import com.Sriram.Part_Time_jobProtal.Model.Role;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET =
            "ThisIsAVeryLongSecretKeyForJwtTokenWhichShouldBeAtLeast32Characters";
    private final long EXPIRATION = 1000 * 60 * 60; // 1 hour

    // 🔐 Create signing key
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // ✅ Generate token with email, role, userId
    public String generateToken(String email, String role, Long userId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 📩 Extract email
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // 👤 Extract role
    public Role extractRole(String token) {
        String fullRole = extractClaims(token).get("role").toString();
        return Role.valueOf(fullRole.replace("ROLE_", ""));
    }

    // 🆔 Extract userId (needed for Apply Job)
    public Long extractUserId(String token) {
        Object idObj = extractClaims(token).get("userId");
        return Long.valueOf(idObj.toString());
    }

    // 📦 Extract all claims
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ⏰ Check expiration
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // ✅ Validate token
    public boolean isValid(String token, String email) {
        return email.equals(extractEmail(token)) && !isTokenExpired(token);
    }
}
