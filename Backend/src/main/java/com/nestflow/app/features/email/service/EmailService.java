package com.nestflow.app.features.email.service;

public interface EmailService {
    void sendSubscriptionExpirationEmail(String email, String customerName);
}
