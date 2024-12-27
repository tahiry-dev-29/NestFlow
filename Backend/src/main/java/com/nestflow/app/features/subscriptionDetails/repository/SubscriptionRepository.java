package com.nestflow.app.features.subscriptionDetails.repository;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetails;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends MongoRepository<SubscriptionDetails, String> {
}
