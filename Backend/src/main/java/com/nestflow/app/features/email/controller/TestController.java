package com.nestflow.app.features.email.controller;

import com.nestflow.app.features.email.service.TestEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/email")
public class TestController {

    @Autowired
    private TestEmailService emailService;

    @GetMapping("/sendTestHtmlEmail")
    public String sendTestHtmlEmail(@RequestParam("subject") String subject,
            @RequestParam("htmlContent") String htmlContent) {
        try {
            emailService.sendHtmlEmail(subject, htmlContent);
            return "Email HTML envoyé avec succès !";
        } catch (MessagingException e) {
            e.printStackTrace();
            return "Erreur lors de l'envoi de l'email HTML : " + e.getMessage();
        }
    }
}