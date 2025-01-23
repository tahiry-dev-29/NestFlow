package com.nestflow.app.features.subscriptionDetails.dto;

import java.time.temporal.ChronoUnit;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity.SubscriptionType;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity.TimeUnit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class RenewalRequest {

    @NotNull(message = "La période de renouvellement ne peut pas être nulle")
    private Integer renewalPeriod;

    @NotBlank(message = "L'unité de temps ne peut pas être vide")
    private String unit;

    @NotNull(message = "Le nouveau type d'abonnement est requis")
    private SubscriptionType newType;

    @NotNull(message = "Le nombre de canaux ne peut pas être nul")
    private Integer customChannelCount;

    public TimeUnit getUnitAsTimeUnit() {
        try {
            return TimeUnit.valueOf(this.unit.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unité de temps invalide fournie.");
        }
    }
}
