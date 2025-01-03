package com.nestflow.app.features.subscriptionDetails.service;

import java.util.List;

import com.nestflow.app.features.subscriptionDetails.dto.RenewalRequest;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionStatusResponse;
import reactor.core.publisher.Mono;

public interface SubscriptionService {

    SubscriptionDetailsEntity createSubscription(SubscriptionDetailsEntity details);

    List<SubscriptionDetailsEntity> getAllSubscriptions();

    SubscriptionDetailsEntity updateSubscription(String id, SubscriptionDetailsEntity details);
    
    SubscriptionDetailsEntity renewSubscription(String id, int renewalPeriod, String unitString, RenewalRequest renewalRequest);

    void deleteSubscription(String id);

    SubscriptionDetailsEntity getSubscriptionById(String id);

    Mono<SubscriptionStatusResponse> getSubscriptionStatus(String id);


}