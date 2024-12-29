package com.nestflow.app.features.subscriptionDetails.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nestflow.app.features.subscriptionDetails.controller.RenewalRequest;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.repository.SubscriptionRepository;

import reactor.core.publisher.Mono;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private BigDecimal getBasePrice(SubscriptionDetailsEntity.SubscriptionType subscriptionType) {
        switch (subscriptionType) {
            case Basique:
                return new BigDecimal("30000");
            case Classique:
                return new BigDecimal("50000");
            default:
                throw new IllegalArgumentException("Type d'abonnement inconnu : " + subscriptionType);
        }
    }

    private int calculateChannelCount(SubscriptionDetailsEntity.SubscriptionType subscriptionType) {
        switch (subscriptionType) {
            case Basique:
                return 250;
            case Classique:
                return 500;
            default:
                throw new IllegalArgumentException("Type d'abonnement inconnu : " + subscriptionType);
        }
    }

    public SubscriptionDetailsEntity createSubscription(SubscriptionDetailsEntity details) {
        LocalDateTime now = LocalDateTime.now();
        details.setSubscriptionStartDate(now);
        details.setSubscriptionEndDate(now.plusMonths(1));

        details.setChannelCount(calculateChannelCount(details.getSubscriptionType()));
        details.setPrice(calculateRenewalPrice(details, 1, ChronoUnit.MONTHS)); // Utilisation de calculateRenewalPrice
                                                                                // pour la création

        String encodedPassword = passwordEncoder.encode(details.getCode());
        details.setCode(encodedPassword);

        details.setStatus(SubscriptionDetailsEntity.Status.active);
        return subscriptionRepository.save(details);
    }
    
    private BigDecimal calculateRenewalPrice(SubscriptionDetailsEntity subscription, int renewalPeriod,
            ChronoUnit unit) {
        BigDecimal basePrice = getBasePrice(subscription.getSubscriptionType());
        BigDecimal duration = new BigDecimal(renewalPeriod);

        switch (unit) {
            case DAYS:
                return basePrice.divide(new BigDecimal("30"), 2, RoundingMode.HALF_UP).multiply(duration);
            case WEEKS:
                return basePrice.divide(new BigDecimal("4"), 2, RoundingMode.HALF_UP).multiply(duration);
            case MONTHS:
                return basePrice.multiply(duration);
            case YEARS:
                return basePrice.multiply(duration.multiply(new BigDecimal("12")));
            default:
                throw new IllegalArgumentException("Unité de temps inconnue : " + unit);
        }
    }

    public SubscriptionDetailsEntity renewSubscription(String id, int renewalPeriod, String unitString,
            RenewalRequest renewalRequest) {
        try {
            Optional<SubscriptionDetailsEntity> optionalSubscription = subscriptionRepository.findById(id);

            if (optionalSubscription.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Abonnement introuvable");
            }

            SubscriptionDetailsEntity existingSubscription = optionalSubscription.get();

            if (existingSubscription.getStatus() != SubscriptionDetailsEntity.Status.active &&
                    existingSubscription.getStatus() != SubscriptionDetailsEntity.Status.expired) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide.");
            }

            ChronoUnit unit;
            try {
                unit = ChronoUnit.valueOf(unitString.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unité invalide : " + unitString);
            }

            LocalDateTime newEndDate;
            if (existingSubscription.getStatus() == SubscriptionDetailsEntity.Status.active) {
                newEndDate = existingSubscription.getSubscriptionEndDate().plus(renewalPeriod, unit);
            } else {
                newEndDate = LocalDateTime.now().plus(renewalPeriod, unit);
            }

            existingSubscription.setSubscriptionEndDate(newEndDate);

            if (renewalRequest != null && renewalRequest.getNewType() != null) {
                existingSubscription.setSubscriptionType(renewalRequest.getNewType());
                existingSubscription.setChannelCount(calculateChannelCount(existingSubscription.getSubscriptionType()));
            }

            existingSubscription.setStatus(SubscriptionDetailsEntity.Status.active);

            // Calcul du prix du RENOUVELLEMENT et ajout au prix existant
            BigDecimal renewalPrice = calculateRenewalPrice(existingSubscription, renewalPeriod, unit);
            if (existingSubscription.getPrice() == null) {
                existingSubscription.setPrice(renewalPrice);
            } else {
                existingSubscription.setPrice(existingSubscription.getPrice().add(renewalPrice));
            }

            return subscriptionRepository.save(existingSubscription);

        } catch (DataAccessException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors de la sauvegarde de l'abonnement", e);
        }
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void updateAllSubscriptionStatuses() {
        List<SubscriptionDetailsEntity> allSubscriptions = subscriptionRepository.findAll();
        for (SubscriptionDetailsEntity subscription : allSubscriptions) {
            updateSubscriptionStatus(subscription);
        }
    }

    public SubscriptionDetailsEntity updateSubscriptionStatus(SubscriptionDetailsEntity details) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(details.getSubscriptionEndDate())) {
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
                    if (details.getFullname() != null) {
                        existingSubscription.setFullname(details.getFullname());
                    }
                    if (details.getEmail() != null) {
                        existingSubscription.setEmail(details.getEmail());
                    }
                    if (details.getAdresse() != null) {
                        existingSubscription.setAdresse(details.getAdresse());
                    }
                    if (details.getTel() != null) {
                        existingSubscription.setTel(details.getTel());
                    }

                    if (details.getCode() != null && !details.getCode().isEmpty()) {
                        String encodedPassword = passwordEncoder.encode(details.getCode());
                        existingSubscription.setCode(encodedPassword);
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

    public Mono<Map<String, Object>> getSubscriptionStatus(String id) {
        return Mono.fromCallable(() -> subscriptionRepository.findById(id))
                .flatMap(optionalSubscription -> {
                    if (optionalSubscription.isEmpty()) {
                        return Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
                    }

                    SubscriptionDetailsEntity subscription = optionalSubscription.get();
                    LocalDateTime now = LocalDateTime.now();
                    LocalDateTime endDate = subscription.getSubscriptionEndDate();
                    LocalDateTime startDate = subscription.getSubscriptionStartDate();

                    if (startDate == null || endDate == null) {
                        return Mono.error(new IllegalStateException("Subscription start or end date is null"));
                    }
                    if (endDate.isBefore(startDate)) {
                        return Mono.error(new IllegalStateException("End date is before start date"));
                    }

                    long remainingDays = ChronoUnit.DAYS.between(now, endDate);
                    long totalDays = Period.between(startDate.toLocalDate(), endDate.toLocalDate()).getDays();

                    double progressPercentage;
                    if (totalDays == 0) {
                        // Handle the case where the total duration is 0 days
                        progressPercentage = 100.0; // Set progress to 100% if total duration is 0
                    } else {
                        progressPercentage = (double) remainingDays / totalDays * 100;
                    }

                    Map<String, Object> status = new HashMap<>();
                    status.put("remainingDays", remainingDays);
                    status.put("progressPercentage", progressPercentage);
                    status.put("isExpired", remainingDays <= 0);
                    status.put("daysUntilExpiration", remainingDays);

                    return Mono.just(status);
                });
    }

}