package com.nestflow.app.features.subscriptionDetails.service;

import java.time.LocalDateTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.repository.SubscriptionRepository;

import reactor.core.publisher.Mono;

@Service
public class SubscriptionService {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionService.class);

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public SubscriptionDetailsEntity createSubscription(SubscriptionDetailsEntity details) {
        LocalDateTime now = LocalDateTime.now();
        details.setSubscriptionStartDate(now);
        details.setSubscriptionEndDate(now.plusDays(31));

        if (details.getSubscriptionType() == SubscriptionDetailsEntity.SubscriptionType.Classique) {
            details.setChannelCount(200);
        } else if (details.getSubscriptionType() == SubscriptionDetailsEntity.SubscriptionType.Basique) {
            details.setChannelCount(100);
        }

        String encodedPassword = passwordEncoder.encode(details.getCode());
        details.setCode(encodedPassword);

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
                if (endDate.isBefore(startDate)){
                    return Mono.error(new IllegalStateException("End date is before start date"));
                }

                long remainingDays = ChronoUnit.DAYS.between(now, endDate);
                long totalDays;
                Object progressPercentage;

                if (remainingDays <= 0) {
                    totalDays = 1;
                    progressPercentage = 0.0;
                } else {
                    Period totalDuration = Period.between(startDate.toLocalDate(), endDate.toLocalDate());
                    totalDays = totalDuration.getDays();

                    if (totalDays == 0) {
                        progressPercentage = "Infinity";
                    } else {
                        progressPercentage = (double) remainingDays / totalDays * 100;
                    }
                }

                Map<String, Object> status = new HashMap<>();
                status.put("remainingDays", remainingDays);
                status.put("progressPercentage", progressPercentage);
                status.put("isExpired", remainingDays <= 0);
                status.put("daysUntilExpiration", remainingDays);

                return Mono.just(status);
            });
}

    public SubscriptionDetailsEntity renewSubscription(String id, int renewalPeriod, String unitString) {
        logger.info("Tentative de renouvellement de l'abonnement avec l'ID : {}", id);
        logger.debug("Période de renouvellement : {}, Unité : {}", renewalPeriod, unitString);

        try {
            Optional<SubscriptionDetailsEntity> optionalSubscription = subscriptionRepository.findById(id);

            if (optionalSubscription.isEmpty()) {
                logger.warn("Abonnement non trouvé avec l'ID : {}", id);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Abonnement non trouvé");
            }

            SubscriptionDetailsEntity existingSubscription = optionalSubscription.get();
            logger.debug("Abonnement trouvé : {}", existingSubscription);
            logger.debug("Statut de l'abonnement : {}", existingSubscription.getStatus());

            if (existingSubscription.getStatus() != SubscriptionDetailsEntity.Status.active &&
                    existingSubscription.getStatus() != SubscriptionDetailsEntity.Status.expired) {
                logger.warn("Statut invalide : {}", existingSubscription.getStatus());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide.");
            }

            LocalDateTime newEndDate;
            ChronoUnit unit = null; // Initialiser unit à null

            if (unitString == null || unitString.isEmpty()) { // Vérification de nullité et de chaîne vide
                logger.error("L'unité de temps (unitString) est nulle ou vide.");
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "L'unité de temps ne peut pas être nulle ou vide.");
            }

            try {
                unit = ChronoUnit.valueOf(unitString.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.error("Unité invalide : {}", unitString, e);
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unité invalide : " + unitString);
            }

            if (existingSubscription.getSubscriptionEndDate() == null) {
                logger.error("subscriptionEndDate est null pour l'abonnement : {}", existingSubscription);
                throw new IllegalStateException("subscriptionEndDate ne peut pas être null.");
            }

            try {
                if (existingSubscription.getStatus() == SubscriptionDetailsEntity.Status.active) {
                    newEndDate = existingSubscription.getSubscriptionEndDate().plus(renewalPeriod, unit);
                } else {
                    newEndDate = LocalDateTime.now().plus(renewalPeriod, unit);
                }
            } catch (Exception e) {
                logger.error("Erreur lors du calcul de la nouvelle date : ", e);
                throw new RuntimeException("Erreur lors du calcul de la nouvelle date", e);
            }

            existingSubscription.setSubscriptionEndDate(newEndDate);
            existingSubscription.setStatus(SubscriptionDetailsEntity.Status.active);

            try {
                SubscriptionDetailsEntity savedSubscription = subscriptionRepository.save(existingSubscription);
                logger.info("Abonnement renouvelé : {}", savedSubscription);
                return savedSubscription;
            } catch (DataAccessException e) {
                logger.error("Erreur lors de la sauvegarde en base de données : ", e);
                throw new RuntimeException("Erreur lors de la sauvegarde de l'abonnement", e);
            }

        } catch (Exception e) {
            logger.error("Erreur inattendue : ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur interne.");
        }
    }

}