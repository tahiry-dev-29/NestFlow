package com.nestflow.app.features.subscriptionDetails.controller;

import java.time.temporal.ChronoUnit;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RenewalRequest {
    @NotNull(message = "La période de renouvellement ne peut pas être nulle")
    private Integer renewalPeriod;

    @NotBlank(message = "L'unité de temps ne peut pas être vide")
    private String unit; // Représentation textuelle de l'unité (ex: "MONTHS", "YEARS")


    public ChronoUnit getUnitAsChronoUnit() {
        try {
            return ChronoUnit.valueOf(this.unit);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid time unit provided.");
        }
    }

}
