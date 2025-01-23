package com.nestflow.app.features.subscriptionDetails.services;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity.SubscriptionType;

public class ChannelCalculator {
    private final SubscriptionType type;
    private final Integer customChannelCount;

    public ChannelCalculator(SubscriptionType type, Integer customChannelCount) {
        this.type = type;
        this.customChannelCount = customChannelCount;
    }

    private int getBaseChannelCount() {
        return SubscriptionConfig.CONFIGS.get(type).getBaseChannels();
    }

    private double getChannelPriceRate() {
        return SubscriptionConfig.CONFIGS.get(type).getChannelPriceRate();
    }

    public double calculateExtraChannelPrice() {
        int customChannels = customChannelCount != null ? customChannelCount : getBaseChannelCount();
        int baseChannels = getBaseChannelCount();

        if (customChannels <= baseChannels) {
            return 0;
        }

        int extraChannels = customChannels - baseChannels;
        return extraChannels * getChannelPriceRate();
    }
}

