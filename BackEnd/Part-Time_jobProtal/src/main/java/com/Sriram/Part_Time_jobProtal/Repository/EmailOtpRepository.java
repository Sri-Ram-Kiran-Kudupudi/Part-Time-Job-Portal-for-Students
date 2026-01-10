package com.Sriram.Part_Time_jobProtal.Repository;

import com.Sriram.Part_Time_jobProtal.Model.EmailOtp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findTopByEmailOrderByIdDesc(String email);
    @Modifying
    @Transactional
    void deleteByEmail(String email);
}


//SELECT * FROM email_otp
//WHERE email = ?
//ORDER BY id DESC
//LIMIT 1;
//Get the most recent OTP for this email