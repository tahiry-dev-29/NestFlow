package com.nestflow.app.features.subscriptionDetails.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.repository.SubscriptionRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public SubscriptionService(SubscriptionRepository subscriptionRepository,
            BCryptPasswordEncoder subscriptionPasswordEncoder) {
        this.subscriptionRepository = subscriptionRepository;
        this.passwordEncoder = subscriptionPasswordEncoder;
    }

    public SubscriptionDetailsEntity createSubscription(SubscriptionDetailsEntity details) {
        LocalDateTime now = LocalDateTime.now();
        details.setSubscriptionStartDate(now);
        details.setSubscriptionEndDate(now.plusDays(31));

        if (details.getSubscriptionType() == SubscriptionDetailsEntity.SubscriptionType.Classique) {
            details.setChannelCount(520);
        } else if (details.getSubscriptionType() == SubscriptionDetailsEntity.SubscriptionType.Basique) {
            details.setChannelCount(310);
        }

        String encodedPassword = passwordEncoder.encode(details.getPassword());
        details.setPassword(encodedPassword);

        details.setProgress(100.0);
        details.setStatus(SubscriptionDetailsEntity.Status.active);
        return subscriptionRepository.save(details);
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void updateAllSubscriptionStatuses() {
        List<SubscriptionDetailsEntity> allSubscriptions = subscriptionRepository.findAll();
        for (SubscriptionDetailsEntity subscription : allSubscriptions) {
            updateSubscriptionStatus(subscription);
        }
    }

    public SubscriptionDetailsEntity updateSubscriptionStatus(SubscriptionDetailsEntity details) {
        long remainingHours = details.getRemainingHours();
        long totalHours = 31 * 24; // Nombre total d'heures dans 31 jours
        double progress = (double) remainingHours / totalHours * 100;
        details.setProgress(progress);

        if (progress <= 90) {
            details.setStatus(SubscriptionDetailsEntity.Status.expired);
        } else {
            details.setStatus(SubscriptionDetailsEntity.Status.active);
        }
        return subscriptionRepository.save(details);
    }

    public SubscriptionDetailsEntity getSubscriptionById(String id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
    }

    public SubscriptionDetailsEntity updateSubscription(String id, SubscriptionDetailsEntity details) {
        return subscriptionRepository.findById(id)
                .map(existingSubscription -> {
                    // Mettre à jour les champs optionnels seulement s'ils sont présents dans
                    // 'details'
                    if (details.getFullname() != null) {
                        existingSubscription.setFullname(details.getFullname());
                    }
                    if (details.getEmail() != null) {
                        existingSubscription.setEmail(details.getEmail());
                    }
                    if (details.getTel() != null) {
                        existingSubscription.setTel(details.getTel());
                    }
                    if (details.getAdresse() != null) {
                        existingSubscription.setAdresse(details.getAdresse());
                    }
                    if (details.getSubscriptionType() != null) {
                        existingSubscription.setSubscriptionType(details.getSubscriptionType());
                        // Recalculer channelCount si subscriptionType est modifié
                        if (details.getSubscriptionType() == SubscriptionDetailsEntity.SubscriptionType.Classique) {
                            existingSubscription.setChannelCount(520);
                        } else if (details
                                .getSubscriptionType() == SubscriptionDetailsEntity.SubscriptionType.Basique) {
                            existingSubscription.setChannelCount(310);
                        }
                    }
                    // GESTION DU MOT DE PASSE (IMPORTANT)
                    if (details.getPassword() != null && !details.getPassword().isEmpty()) {
                        // Hacher le nouveau mot de passe AVANT de l'enregistrer
                        String encodedPassword = passwordEncoder.encode(details.getPassword());
                        existingSubscription.setPassword(encodedPassword);
                    }

                    return subscriptionRepository.save(existingSubscription);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
    }

    public void deleteSubscription(String id) {
        subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        subscriptionRepository.deleteById(id);
    }

    public List<SubscriptionDetailsEntity> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    public SubscriptionDetailsEntity renewSubscription(String id, int renewalPeriod, ChronoUnit unit) {
        return subscriptionRepository.findById(id)
                .map(existingSubscription -> {
                    LocalDateTime now = LocalDateTime.now();

                    // Validation : L'abonnement doit être actif ou expiré mais renouvelable (à
                    // définir)
                    if (existingSubscription.getStatus() != SubscriptionDetailsEntity.Status.active &&
                            existingSubscription.getStatus() != SubscriptionDetailsEntity.Status.expired) { // Exemple
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Subscription cannot be renewed in its current state.");
                    }

                    LocalDateTime newEndDate;

                    if (existingSubscription.getStatus() == SubscriptionDetailsEntity.Status.active) {
                        // Renouvellement d'un abonnement ACTIF : on ajoute la période à la date de fin
                        // actuelle
                        newEndDate = existingSubscription.getSubscriptionEndDate().plus(renewalPeriod, unit);
                    } else {
                        // Renouvellement d'un abonnement EXPIRE : on ajoute la période à la date du
                        // jour
                        newEndDate = now.plus(renewalPeriod, unit);
                    }

                    existingSubscription.setSubscriptionEndDate(newEndDate);
                    existingSubscription.setStatus(SubscriptionDetailsEntity.Status.active); // Important : Réactiver
                                                                                             // l'abonnement
                    return subscriptionRepository.save(existingSubscription);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
    }
}