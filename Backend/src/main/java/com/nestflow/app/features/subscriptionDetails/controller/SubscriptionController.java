package com.nestflow.app.features.subscriptionDetails.controller;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @Autowired
    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/add")
    public ResponseEntity<SubscriptionDetailsEntity> createSubscription(
            @RequestBody SubscriptionDetailsEntity details) {
        SubscriptionDetailsEntity created = subscriptionService.createSubscription(details);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/all")
    public ResponseEntity<List<SubscriptionDetailsEntity>> getAllSubscriptions() {
        List<SubscriptionDetailsEntity> subscriptions = subscriptionService.getAllSubscriptions();
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<SubscriptionDetailsEntity> getSubscriptionById(@PathVariable String id) {
        SubscriptionDetailsEntity subscription = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(subscription);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<SubscriptionDetailsEntity> updateSubscription(@PathVariable String id,
            @RequestBody SubscriptionDetailsEntity details) {
        SubscriptionDetailsEntity updated = subscriptionService.updateSubscription(id, details);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable String id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }

    
    @SuppressWarnings("null")
    @PatchMapping("/{id}/renew")
    public ResponseEntity<SubscriptionDetailsEntity> renewSubscription(
            @PathVariable String id,
            @RequestBody RenewalRequest renewalRequest) {

        try {
            ChronoUnit unit = renewalRequest.getUnitAsChronoUnit(); // Convert unit to ChronoUnit
            SubscriptionDetailsEntity renewedSubscription = subscriptionService.renewSubscription(
                    id, renewalRequest.getRenewalPeriod(), unit);
            return new ResponseEntity<>(renewedSubscription, HttpStatus.OK);
        } catch (ResponseStatusException e) {
            return new ResponseEntity<>(null, e.getStatusCode());
        }
    }

}