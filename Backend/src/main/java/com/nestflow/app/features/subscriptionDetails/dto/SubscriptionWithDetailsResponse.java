package com.nestflow.app.features.subscriptionDetails.dto;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionStatusResponse;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionWithDetailsResponse {
    private SubscriptionStatusResponse status;
    private SubscriptionDetailsEntity details;
}
