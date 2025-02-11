package com.nestflow.app.features.subscriptionDetails.repository;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends MongoRepository<SubscriptionDetailsEntity, String> {

    default List<SubscriptionDetailsEntity> findAllBlocking() {
        return findAll();
    }
}
