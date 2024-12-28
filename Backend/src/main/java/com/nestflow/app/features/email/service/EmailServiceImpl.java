package com.nestflow.app.features.email.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendSubscriptionExpirationEmail(String email, String customerName) {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8"); // Important pour les caractères spéciaux
        try {
            helper.setSubject("Your Subscription with Nestflow has Expired");
            helper.setFrom("noreply@nestflow.com"); // Use a valid "from" address
            helper.setTo(email);
            helper.setText(buildEmailContent(customerName), true); // true for HTML

            mailSender.send(message);
            logger.info("Email sent successfully to: {}", email); // Log en cas de succès
        } catch (MessagingException e) {
            logger.error("MessagingException while sending email to {}: {}", email, e.getMessage(), e);
            // Gérer l'exception de manière plus fine (par exemple, en relançant une
            // exception personnalisée)
            throw new RuntimeException("Failed to send email due to messaging error", e);
        } catch (MailException e) {
            logger.error("MailException while sending email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to send email due to mail error", e);
        } catch (Exception e) {
            logger.error("Unexpected exception while sending email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Failed to send email due to unexpected error", e);
        }
    }

    private String buildEmailContent(String customerName) {
        return String.format(
                "Dear %s,<br><br>Your subscription with Nestflow has expired.<br><br>" +
                        "Click here to renew: [Link to renewal page]<br><br>" +
                        "Sincerely,<br>The Nestflow Team",
                customerName);
    }
}