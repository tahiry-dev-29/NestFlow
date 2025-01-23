package com.nestflow.app.features.subscriptionDetails.services;

import java.util.List;

import com.nestflow.app.features.subscriptionDetails.dto.RenewalRequest;
import com.nestflow.app.features.subscriptionDetails.dto.SubscriptionWithDetailsResponse;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity.SubscriptionType;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity.TimeUnit;

public interface SubscriptionService {

    List<SubscriptionWithDetailsResponse> getAllSubscriptionsWithDetails();

    SubscriptionDetailsEntity createSubscription(SubscriptionDetailsEntity details);

    SubscriptionDetailsEntity getSubscriptionById(String id);

    void deleteSubscription(String id);

    SubscriptionDetailsEntity updateSubscription(String id, SubscriptionDetailsEntity details);

    SubscriptionDetailsEntity renewSubscription(String id, RenewalRequest renewalRequest);

}