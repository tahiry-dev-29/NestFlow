package com.nestflow.app.features.subscriptionDetails.services;

import java.util.List;

import com.nestflow.app.features.subscriptionDetails.dto.RenewalRequest;
import com.nestflow.app.features.subscriptionDetails.dto.SubscriptionWithDetailsResponse;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;

public interface SubscriptionService {

    SubscriptionDetailsEntity createSubscription(SubscriptionDetailsEntity details);


    SubscriptionDetailsEntity updateSubscription(String id, SubscriptionDetailsEntity details);
    
    SubscriptionDetailsEntity renewSubscription(String id, int renewalPeriod, String unitString, RenewalRequest renewalRequest);

    void deleteSubscription(String id);

    SubscriptionDetailsEntity getSubscriptionById(String id);

    List<SubscriptionWithDetailsResponse> getAllSubscriptionsWithDetails();

}