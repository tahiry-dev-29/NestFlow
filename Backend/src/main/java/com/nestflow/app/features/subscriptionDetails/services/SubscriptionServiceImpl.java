package com.nestflow.app.features.subscriptionDetails.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nestflow.app.features.subscriptionDetails.dto.RenewalRequest;
import com.nestflow.app.features.subscriptionDetails.dto.SubscriptionWithDetailsResponse;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionStatusResponse;
import com.nestflow.app.features.subscriptionDetails.repository.SubscriptionRepository;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public List<SubscriptionWithDetailsResponse> getAllSubscriptionsWithDetails() {
        List<SubscriptionDetailsEntity> subscriptions = subscriptionRepository.findAllBlocking();
        return subscriptions.stream()
                .map(subscription -> {
                    // Calculer dynamiquement les champs nécessaires
                    SubscriptionStatusResponse status = mapSubscriptionToStatusResponse(subscription);
                    return new SubscriptionWithDetailsResponse(status, subscription);
                })
                .collect(Collectors.toList());
    }

    private LocalDateTime calculateEndDate(LocalDateTime startDate, int duration,
            SubscriptionDetailsEntity.TimeUnit timeUnit) {
        switch (timeUnit) {
            case DAYS:
                return startDate.plusDays(duration);
            case WEEKS:
                return startDate.plusWeeks(duration);
            case MONTHS:
                return startDate.plusMonths(duration);
            case YEARS:
                return startDate.plusYears(duration);
            default:
                throw new IllegalArgumentException("Unsupported time unit: " + timeUnit);
        }
    }


    private SubscriptionStatusResponse mapSubscriptionToStatusResponse(SubscriptionDetailsEntity subscription) {
        LocalDateTime startDate = subscription.getSubscriptionStartDate();
        int duration = subscription.getDuration();
        SubscriptionDetailsEntity.TimeUnit timeUnit = subscription.getTimeUnit();

        if (startDate == null || timeUnit == null || duration <= 0) {
            throw new IllegalStateException(
                    "Invalid subscription data for subscription ID: " + subscription.getId());
        }

        LocalDateTime endDate = calculateEndDate(startDate, duration, timeUnit);
        subscription.setSubscriptionEndDate(endDate);

        LocalDateTime now = LocalDateTime.now();

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate);

        long remainingDays = ChronoUnit.DAYS.between(now, endDate);

        long elapsedDays = ChronoUnit.DAYS.between(startDate, now);

        double progressPercentage = (totalDays > 0)
                ? (Math.max(0, Math.min(elapsedDays, totalDays)) / (double) totalDays) * 100
                : 100.0;

        if (progressPercentage < 10.0) {
            subscription.setStatus(SubscriptionDetailsEntity.Status.ACTIVE);
        } else {
            subscription.setStatus(SubscriptionDetailsEntity.Status.EXPIRED);
        }

        return new SubscriptionStatusResponse(remainingDays, 100.0 - progressPercentage, remainingDays <= 0);
    }

    @Override
    public SubscriptionDetailsEntity createSubscription(SubscriptionDetailsEntity details) {
        LocalDateTime now = LocalDateTime.now();
        details.setSubscriptionStartDate(now);

        LocalDateTime endDate = switch (details.getTimeUnit()) {
            case DAYS -> now.plusDays(details.getDuration());
            case WEEKS -> now.plusWeeks(details.getDuration());
            case MONTHS -> now.plusMonths(details.getDuration());
            case YEARS -> now.plusYears(details.getDuration());
        };
        details.setSubscriptionEndDate(endDate);

        String encodedPassword = passwordEncoder.encode(details.getCode());
        details.setCode(encodedPassword);

        return subscriptionRepository.save(details);
    }

    /*
     * private void validateSubscriptionStatus(SubscriptionDetailsEntity
     * subscription) {
     * if (subscription.getStatus() != SubscriptionDetailsEntity.Status.ACTIVE
     * && subscription.getStatus() != SubscriptionDetailsEntity.Status.EXPIRED) {
     * throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
     * "Statut invalide.");
     * }
     * }
     */

    /*
     * private LocalDateTime calculateNewEndDate(SubscriptionDetailsEntity
     * subscription, int renewalPeriod,
     * ChronoUnit unit) {
     * LocalDateTime currentEndDate = subscription.getSubscriptionEndDate();
     * return (currentEndDate == null ? subscription.getSubscriptionStartDate() :
     * currentEndDate).plus(renewalPeriod,
     * unit);
     * }
     */
    /*
     * private void updateSubscriptionDetails(SubscriptionDetailsEntity
     * subscription, RenewalRequest renewalRequest) {
     * if (renewalRequest != null && renewalRequest.getNewType() != null) {
     * subscription.setSubscriptionType(renewalRequest.getNewType());
     * //
     * subscription.setChannelCount(calculateChannelCount(renewalRequest.getNewType(
     * )));
     * }
     * }
     * 
     * private TimeUnit parseTimeUnit(String unitString) {
     * try {
     * return TimeUnit.valueOf(unitString.toUpperCase());
     * } catch (IllegalArgumentException e) {
     * throw new InvalidTimeUnitException("Unité invalide : " + unitString);
     * }
     * }
     */

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
    public SubscriptionDetailsEntity renewSubscription(String id, RenewalRequest renewalRequest) {
        SubscriptionDetailsEntity subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));

        subscription.updateSubscription(renewalRequest);

        int channelCount = renewalRequest.getChannelCount() != null ? renewalRequest.getChannelCount() : SubscriptionConfig.CONFIGS.get(renewalRequest.getSubscriptionType()).getBaseChannels();

        SubscriptionCalculator calculator = new SubscriptionCalculator(
                renewalRequest.getSubscriptionType(),
                renewalRequest.getRenewalPeriod(),
                renewalRequest.getUnit(),
                channelCount);

        double totalPrice = calculator.calculateTotalPrice();
        subscription.setPrice(BigDecimal.valueOf(totalPrice));
        subscription.setChannelCount(channelCount);
        subscription.setSubscriptionType(renewalRequest.getSubscriptionType());
        subscription.setStatus(SubscriptionDetailsEntity.Status.ACTIVE);

        return subscriptionRepository.save(subscription);
    }


}