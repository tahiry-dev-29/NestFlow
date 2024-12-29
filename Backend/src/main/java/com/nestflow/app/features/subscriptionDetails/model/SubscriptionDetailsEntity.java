package com.nestflow.app.features.subscriptionDetails.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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

    private SubscriptionType subscriptionType;
    private int channelCount;
    private LocalDateTime subscriptionStartDate;
    private LocalDateTime subscriptionEndDate;
    private Status status;
    private BigDecimal price; // Ajout du champ price en BigDecimal

    public enum SubscriptionType {
        Basique, Classique
    }

    public enum Status {
        active, expired
    }

    public long getRemainingDays() {
        if (subscriptionEndDate == null) {
            return 0; // Gérer le cas où la date de fin est nulle
        }
        return ChronoUnit.DAYS.between(LocalDateTime.now(), subscriptionEndDate);
    }

    public long getRemainingHours() {
        if (subscriptionEndDate == null) {
            return 0; // Gérer le cas où la date de fin est nulle
        }
        return ChronoUnit.HOURS.between(LocalDateTime.now(), subscriptionEndDate);
    }
}