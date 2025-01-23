package com.nestflow.app.features.subscriptionDetails.services;

public class PriceCalculator {
    private double value;

    public PriceCalculator(double value) {
        this.value = value;
    }

    public PriceCalculator divide(double divisor) {
        this.value = Math.round((this.value / divisor) * 100.0) / 100.0;
        return this;
    }

    public PriceCalculator multiply(double multiplier) {
        this.value = Math.round((this.value * multiplier) * 100.0) / 100.0;
        return this;
    }

    public double getValue() {
        return value;
    }
}
