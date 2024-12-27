package com.nestflow.app.features.subscriptionDetails.controller;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetails;
import com.nestflow.app.features.subscriptionDetails.service.SubscriptionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    @Autowired
    private SubscriptionService subscriptionService;

    @PostMapping
    public ResponseEntity<SubscriptionDetails> createSubscription(@RequestBody SubscriptionDetails details) {
        SubscriptionDetails created = subscriptionService.createSubscription(details);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/all")
    public ResponseEntity<List<SubscriptionDetails>> getAllSubscriptions() {
        List<SubscriptionDetails> subscriptions = subscriptionService.getAllSubscriptions();
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<SubscriptionDetails> getSubscriptionById(@PathVariable String id) {
        Optional<SubscriptionDetails> subscription = subscriptionService.getSubscriptionById(id);
        return subscription.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<SubscriptionDetails> updateSubscription(@PathVariable String id, @RequestBody SubscriptionDetails details) {
        SubscriptionDetails updated = subscriptionService.updateSubscription(id, details);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable String id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/renew/{id}")
    public ResponseEntity<Void> renewSubscription(@PathVariable String id) {
        subscriptionService.renewSubscription(id);
        return ResponseEntity.ok().build();
    }
}
