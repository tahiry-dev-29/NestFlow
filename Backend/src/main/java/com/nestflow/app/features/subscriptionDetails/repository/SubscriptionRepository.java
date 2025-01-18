package com.nestflow.app.features.subscriptionDetails.repository;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;


import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends MongoRepository<SubscriptionDetailsEntity, String> {
    List<SubscriptionDetailsEntity> findAll(); // Changed return type to List for compatibility

    default List<SubscriptionDetailsEntity> findAllBlocking() {
        return findAll(); // Directly return List
    }
}
