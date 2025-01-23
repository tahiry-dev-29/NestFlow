package com.nestflow.app.features.subscriptionDetails.services;


import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity.SubscriptionType;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity.TimeUnit;

public class SubscriptionCalculator {
    private final PriceCalculator calculator;
    private final ChannelCalculator channelCalculator;
    private final SubscriptionType type;
    private final int duration;
    private final TimeUnit unit;

    public SubscriptionCalculator(SubscriptionType type, int duration, TimeUnit unit, int customChannelCount) {
        this.type = type; // Pas de valeur par défaut ici, car le type est maintenant obligatoire dans la requête.
        this.duration = duration;
        this.unit = unit;
        SubscriptionConfig.Config config = SubscriptionConfig.CONFIGS.get(this.type);
        this.calculator = new PriceCalculator(config.getBasePrice());
        this.channelCalculator = new ChannelCalculator(this.type, customChannelCount);
    }

    public double calculateTimeBasedPrice() {
        switch (unit) {
            case DAYS:
                return calculator.divide(30).multiply(duration).getValue();
            case WEEKS:
                return calculator.divide(4).multiply(duration).getValue();
            case MONTHS:
                return calculator.multiply(duration).getValue();
            case YEARS:
                return calculator.multiply(duration * 12).getValue();
            default:
                throw new IllegalArgumentException("Unsupported time unit: " + unit);
        }
    }

    public double calculateTotalPrice() {
        double timeBasedPrice = calculateTimeBasedPrice();
        double extraChannelPrice = channelCalculator.calculateExtraChannelPrice();
        return timeBasedPrice + extraChannelPrice;
    }
}

