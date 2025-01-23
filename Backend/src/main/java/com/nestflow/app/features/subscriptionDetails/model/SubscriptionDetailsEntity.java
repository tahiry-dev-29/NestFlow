package com.nestflow.app.features.subscriptionDetails.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.nestflow.app.features.subscriptionDetails.dto.RenewalRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "subscriptions")
public class SubscriptionDetailsEntity {

    @Id
    private String id = UUID.randomUUID().toString();
    private String fullname;
    private String email;
    private String tel;
    private String adresse;
    private String code;

    private int channelCount;
    private SubscriptionType subscriptionType;

    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;

    private int duration; // Mis à jour lors du renouvellement
    private TimeUnit timeUnit;

    private Status status;
    private BigDecimal price;

    public enum SubscriptionType {
        BASIC, CLASSIC
    }

    public enum TimeUnit {
        DAYS, WEEKS, MONTHS, YEARS
    }

    public enum Status {
        ACTIVE, EXPIRED
    }

    public long getRemainingDays() {
        if (subscriptionEndDate == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(LocalDateTime.now(), subscriptionEndDate);
    }

    public long getRemainingHours() {
        if (subscriptionEndDate == null) {
            return 0;
        }
        return ChronoUnit.HOURS.between(LocalDateTime.now(), subscriptionEndDate);
    }

    public void updateSubscription(RenewalRequest request) {
        this.duration = request.getRenewalPeriod();
        this.timeUnit = request.getUnit();

        LocalDateTime newStartDate = this.subscriptionEndDate.isBefore(LocalDateTime.now()) ? LocalDateTime.now() : this.subscriptionEndDate;
        this.subscriptionStartDate = newStartDate;
        this.subscriptionEndDate = calculateNewEndDate(newStartDate, duration, timeUnit);

        if (this.status == Status.EXPIRED) {
            this.status = Status.ACTIVE;
        }
    }

    private LocalDateTime calculateNewEndDate(LocalDateTime startDate, int renewalPeriod, TimeUnit unit) {
        switch (unit) {
            case DAYS:
                return startDate.plusDays(renewalPeriod);
            case WEEKS:
                return startDate.plusWeeks(renewalPeriod);
            case MONTHS:
                return startDate.plusMonths(renewalPeriod);
            case YEARS:
                return startDate.plusYears(renewalPeriod);
            default:
                throw new IllegalArgumentException("Unité de temps non supportée : " + unit);
        }
    }
}