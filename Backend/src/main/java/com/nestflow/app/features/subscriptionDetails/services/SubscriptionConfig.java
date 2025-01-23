package com.nestflow.app.features.subscriptionDetails.services;

import java.util.Map;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity.SubscriptionType;

public class SubscriptionConfig {
    public static final Map<SubscriptionType, Config> CONFIGS = Map.of(
        SubscriptionType.BASIC, new Config(30000, 250, 1.2),
        SubscriptionType.CLASSIC, new Config(50000, 500, 1.5)
    );

    public static class Config {
        private final double basePrice;
        private final int baseChannels;
        private final double channelPriceRate;

        public Config(double basePrice, int baseChannels, double channelPriceRate) {
            this.basePrice = basePrice;
            this.baseChannels = baseChannels;
            this.channelPriceRate = channelPriceRate;
        }

        public double getBasePrice() {
            return basePrice;
        }

        public int getBaseChannels() {
            return baseChannels;
        }

        public double getChannelPriceRate() {
            return channelPriceRate;
        }
    }
}
