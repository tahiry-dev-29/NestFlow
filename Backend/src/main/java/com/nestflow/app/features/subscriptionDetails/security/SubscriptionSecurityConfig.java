package com.nestflow.app.features.subscriptionDetails.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SubscriptionSecurityConfig {

    @Bean
    public BCryptPasswordEncoder subscriptionPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
