package com.Sriram.Part_Time_jobProtal.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class MailTestController {

    private final JavaMailSender mailSender;  //when app starts soring creates this sender using the app.props file fields data

    @GetMapping("/mail")
    @PreAuthorize("hasRole('ADMIN')")
    public String sendTestMail() {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("23pa1a12a9@vishnu.edu.in");
        message.setSubject("Mail Test");
        message.setText(" Mail is working fine");

        try {
            mailSender.send(message);
            return "Mail sent successfully";
        } catch (Exception e) {
            return "Mail failed: " + e.getMessage();
        }

    }
}

