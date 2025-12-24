package com.Sriram.Part_Time_jobProtal.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class MailTestController {

    private final JavaMailSender mailSender;

    @GetMapping("/mail")
    public String sendTestMail() {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("sriramkudupudi@gmail.com");
        message.setSubject("Mail Test");
        message.setText("🎉 Mail is working fine");

        mailSender.send(message);
        return "Mail sent successfully";
    }
}

