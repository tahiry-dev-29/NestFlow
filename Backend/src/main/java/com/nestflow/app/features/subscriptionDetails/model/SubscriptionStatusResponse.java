package com.nestflow.app.features.subscriptionDetails.model;

import lombok.Data;

@Data
public class SubscriptionStatusResponse {
    private long remainingDays;
    private double progressPercentage;
    private boolean isExpired;

    public SubscriptionStatusResponse(long remainingDays, double progressPercentage, boolean isExpired) {
        this.remainingDays = remainingDays;
        this.progressPercentage = progressPercentage;
        this.isExpired = isExpired;
    }

    public boolean isExpired() {
        return isExpired;
    }

    public long getDaysUntilExpiration() {
        return remainingDays;
    }
}