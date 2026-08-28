package com.flamecrust.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendOtpEmail(String toEmail, String otp) {
        if (mailSender == null || mailUsername == null || mailUsername.trim().isEmpty()) {
            log.warn("SMTP username not configured. Skipping email sending to {}", toEmail);
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailUsername.trim());
            message.setTo(toEmail.trim());
            message.setSubject("Your Flame & Crust Login Code: " + otp);
            message.setText("Your OTP for login is: " + otp + "\n\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this email.");
            
            mailSender.send(message);
            log.info("OTP email sent successfully to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }
}
