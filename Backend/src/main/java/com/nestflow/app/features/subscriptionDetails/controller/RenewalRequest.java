package com.nestflow.app.features.subscriptionDetails.controller;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity.SubscriptionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.temporal.ChronoUnit;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Data
public class RenewalRequest {

    @NotNull(message = "La période de renouvellement ne peut pas être nulle")
    private Integer renewalPeriod;

    @NotBlank(message = "L'unité de temps ne peut pas être vide")
    private String unit; // Représentation textuelle de l'unité (ex: "MONTHS", "YEARS", "DAYS", "WEEKS")

    @NotNull(message = "Le nouveau type d'abonnement est requis")
    private SubscriptionType newType;

    public ChronoUnit getUnitAsChronoUnit() {
        try {
            return ChronoUnit.valueOf(this.unit.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unité de temps invalide fournie.");
        }
    }
}