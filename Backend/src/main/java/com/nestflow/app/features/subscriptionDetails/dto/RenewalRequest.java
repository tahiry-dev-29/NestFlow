package com.nestflow.app.features.subscriptionDetails.dto;

import lombok.Data;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;

import jakarta.validation.constraints.NotNull;

@Data
public class RenewalRequest {
    @NotNull(message = "Le type d'abonnement est requis")
    private SubscriptionDetailsEntity.SubscriptionType subscriptionType;

    @NotNull(message = "La période de renouvellement est requise")
    private int renewalPeriod;

    @NotNull(message = "L'unité de temps est requise")
    private SubscriptionDetailsEntity.TimeUnit unit;
    
    private Integer channelCount;
}