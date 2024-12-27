package com.nestflow.app.features.subscriptionDetails.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetails;
import com.nestflow.app.features.subscriptionDetails.repository.SubscriptionRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionService {
    
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    public SubscriptionDetails createSubscription(SubscriptionDetails details) {
        details.setSubscriptionStartDate(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        details.setSubscriptionEndDate(LocalDateTime.now().plusDays(31).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        details.setStatus(SubscriptionDetails.Status.active);
        details.setProgress(100.0);
        return subscriptionRepository.save(details);
    }

    public List<SubscriptionDetails> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    public Optional<SubscriptionDetails> getSubscriptionById(String id) {
        return subscriptionRepository.findById(id);
    }

    public SubscriptionDetails updateSubscription(String id, SubscriptionDetails details) {
        Optional<SubscriptionDetails> existingSubscription = subscriptionRepository.findById(id);
        if (existingSubscription.isPresent()) {
            SubscriptionDetails updatedSubscription = existingSubscription.get();
            updatedSubscription.setFullname(details.getFullname());
            updatedSubscription.setEmail(details.getEmail());
            updatedSubscription.setTel(details.getTel());
            updatedSubscription.setAdresse(details.getAdresse());
            updatedSubscription.setSubscriptionType(details.getSubscriptionType());
            updatedSubscription.setChannelCount(details.getChannelCount());
            return subscriptionRepository.save(updatedSubscription);
        }
        return null;
    }

    public void deleteSubscription(String id) {
        subscriptionRepository.deleteById(id);
    }

    public void renewSubscription(String id) {
        Optional<SubscriptionDetails> subscription = subscriptionRepository.findById(id);
        if (subscription.isPresent()) {
            SubscriptionDetails updatedSubscription = subscription.get();
            updatedSubscription.setSubscriptionStartDate(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            updatedSubscription.setSubscriptionEndDate(LocalDateTime.now().plusDays(31).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            updatedSubscription.setStatus(SubscriptionDetails.Status.active);
            updatedSubscription.setProgress(100.0);
            subscriptionRepository.save(updatedSubscription);
        }
    }
}
