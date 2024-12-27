package com.nestflow.app.features.subscriptionDetails.controller;

import java.time.temporal.ChronoUnit;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class RenewalRequest {
    private int renewalPeriod;
    private String unit; // Représentation textuelle de l'unité (ex: "MONTHS", "YEARS")

    public int getRenewalPeriod() {
        return renewalPeriod;
    }

    public void setRenewalPeriod(int renewalPeriod) {
        this.renewalPeriod = renewalPeriod;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public ChronoUnit getUnitAsChronoUnit() {
        try {
            return ChronoUnit.valueOf(this.unit);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid time unit provided.");
        }
    }

}
