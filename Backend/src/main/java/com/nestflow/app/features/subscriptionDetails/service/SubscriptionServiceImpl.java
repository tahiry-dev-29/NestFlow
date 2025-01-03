package com.nestflow.app.features.subscriptionDetails.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nestflow.app.features.common.exceptions.InvalidTimeUnitException;
import com.nestflow.app.features.subscriptionDetails.dto.RenewalRequest;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionStatusResponse;
import com.nestflow.app.features.subscriptionDetails.repository.SubscriptionRepository;

import reactor.core.publisher.Mono;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private BigDecimal getBasePrice(SubscriptionDetailsEntity.SubscriptionType subscriptionType) {
        switch (subscriptionType) {
            case BASIC:
                return new BigDecimal("30000");
            case CLASSIC:
                return new BigDecimal("50000");
            default:
                throw new IllegalArgumentException("Type d'abonnement inconnu : " + subscriptionType);
        }
    }

    private int calculateChannelCount(SubscriptionDetailsEntity.SubscriptionType subscriptionType) {
        switch (subscriptionType) {
            case BASIC:
                return 250;
            case CLASSIC:
                return 500;
            default:
                throw new IllegalArgumentException("Type d'abonnement inconnu : " + subscriptionType);
        }
    }

    @Override
    public SubscriptionDetailsEntity createSubscription(SubscriptionDetailsEntity details) {
        LocalDateTime now = LocalDateTime.now();
        details.setSubscriptionStartDate(now);
        details.setSubscriptionEndDate(now.plusMonths(1));
        details.setChannelCount(calculateChannelCount(details.getSubscriptionType()));
        details.setPrice(calculateRenewalPrice(details, 1, ChronoUnit.MONTHS));

        String encodedPassword = passwordEncoder.encode(details.getCode());
        details.setCode(encodedPassword);

        details.setStatus(SubscriptionDetailsEntity.Status.ACTIVE);
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

    @Override
    public SubscriptionDetailsEntity renewSubscription(String id, int renewalPeriod, String unitString,
            RenewalRequest renewalRequest) {
        SubscriptionDetailsEntity existingSubscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription introuvable"));

        validateSubscriptionStatus(existingSubscription);
        ChronoUnit unit = parseChronoUnit(unitString);

        LocalDateTime newEndDate = calculateNewEndDate(existingSubscription, renewalPeriod, unit);
        existingSubscription.setSubscriptionEndDate(newEndDate);

        updateSubscriptionDetails(existingSubscription, renewalRequest);
        existingSubscription.setStatus(SubscriptionDetailsEntity.Status.ACTIVE);

        BigDecimal renewalPrice = calculateRenewalPrice(existingSubscription, renewalPeriod, unit);
        existingSubscription.setPrice(existingSubscription.getPrice() == null ? renewalPrice
                : existingSubscription.getPrice().add(renewalPrice));

        return subscriptionRepository.save(existingSubscription);
    }

    private void validateSubscriptionStatus(SubscriptionDetailsEntity subscription) {
        if (subscription.getStatus() != SubscriptionDetailsEntity.Status.ACTIVE
                && subscription.getStatus() != SubscriptionDetailsEntity.Status.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide.");
        }
    }

    private LocalDateTime calculateNewEndDate(SubscriptionDetailsEntity subscription, int renewalPeriod,
            ChronoUnit unit) {
        LocalDateTime currentEndDate = subscription.getSubscriptionEndDate();
        return (currentEndDate == null ? subscription.getSubscriptionStartDate() : currentEndDate).plus(renewalPeriod,
                unit);
    }

    private void updateSubscriptionDetails(SubscriptionDetailsEntity subscription, RenewalRequest renewalRequest) {
        if (renewalRequest != null && renewalRequest.getNewType() != null) {
            subscription.setSubscriptionType(renewalRequest.getNewType());
            subscription.setChannelCount(calculateChannelCount(renewalRequest.getNewType()));
        }
    }

    private ChronoUnit parseChronoUnit(String unitString) {
        try {
            return ChronoUnit.valueOf(unitString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidTimeUnitException("Unité invalide : " + unitString);
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
        details.setStatus(now.isAfter(details.getSubscriptionEndDate()) ? SubscriptionDetailsEntity.Status.EXPIRED
                : SubscriptionDetailsEntity.Status.ACTIVE);
        return subscriptionRepository.save(details);
    }

    @Override
    public SubscriptionDetailsEntity getSubscriptionById(String id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
    }

    @Override
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

    @Override
    public void deleteSubscription(String id) {
        subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        subscriptionRepository.deleteById(id);
    }

    @Override
    public List<SubscriptionDetailsEntity> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    @Override
    public Mono<SubscriptionStatusResponse> getSubscriptionStatus(String id) {
        return Mono.fromCallable(() -> subscriptionRepository.findById(id))
                .flatMap(optionalSubscription -> {
                    if (optionalSubscription.isEmpty()) {
                        return Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
                    }

                    SubscriptionDetailsEntity subscription = optionalSubscription.get();
                    LocalDateTime startDate = subscription.getSubscriptionStartDate();
                    LocalDateTime endDate = subscription.getSubscriptionEndDate();

                    if (startDate == null || endDate == null) {
                        return Mono.error(new IllegalStateException("Subscription start or end date is null"));
                    }
                    if (endDate.isBefore(startDate)) {
                        return Mono.error(new IllegalStateException("End date is before start date"));
                    }

                    ZoneId zoneId = ZoneId.of("UTC");
                    LocalDateTime now = LocalDateTime.now(zoneId);
                    startDate = startDate.atZone(zoneId).toLocalDateTime();
                    endDate = endDate.atZone(zoneId).toLocalDateTime();

                    long totalDays = ChronoUnit.DAYS.between(startDate, endDate);
                    long remainingDays = ChronoUnit.DAYS.between(now, endDate);

                    double progressPercentage;
                    if (totalDays <= 0) {
                        progressPercentage = 100.0;
                    } else {
                        long elapsedDays = ChronoUnit.DAYS.between(startDate, now);
                        progressPercentage = (double) elapsedDays / totalDays * 100;
                    }

                    double reversedPercentage = 100.0 - progressPercentage;

                    return Mono.just(
                            new SubscriptionStatusResponse(remainingDays, reversedPercentage, remainingDays <= 0));
                });
    }

}