package com.nestflow.app.features.email.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException; // Import correct

import jakarta.mail.internet.MimeMessage;

@Service
public class TestEmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Value("${app.mail.destinataire}")
    private String destinataire;

    public void sendHtmlEmail(String subject, String htmlContent) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("tannertahirykevin@gmail.com"); // Votre adresse d'expéditeur
        helper.setTo(destinataire);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true pour HTML

        emailSender.send(message);
    }
}