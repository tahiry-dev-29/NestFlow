package com.nestflow.app.features.subscriptionDetails.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.service.SubscriptionService;

import jakarta.validation.Valid;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    
    private static final Logger logger = LoggerFactory.getLogger(SubscriptionService.class);

    @Autowired
    private SubscriptionService subscriptionService;

    @PostMapping("/add")
    public ResponseEntity<SubscriptionDetailsEntity> createSubscription(
            @RequestBody SubscriptionDetailsEntity details) {
        SubscriptionDetailsEntity created = subscriptionService.createSubscription(details);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/lists")
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
    
    @GetMapping("/get/{id}/status")
    public Mono<ResponseEntity<Map<String, Object>>> getSubscriptionStatus(@PathVariable String id) {
        return subscriptionService.getSubscriptionStatus(id)
                .map(status -> ResponseEntity.ok(status)) // Map the status to a ResponseEntity
                .onErrorResume(ResponseStatusException.class, e -> Mono.just(new ResponseEntity<>(e.getStatusCode()))) 
                .onErrorResume(IllegalStateException.class, e -> Mono.just(ResponseEntity.status(500).build()));
    }

    @SuppressWarnings("null")
    @PatchMapping("/set/{id}/renew")
    public ResponseEntity<SubscriptionDetailsEntity> renewSubscription(
            @PathVariable String id,
            @Valid @RequestBody RenewalRequest renewalRequest,
            BindingResult bindingResult) throws MethodArgumentNotValidException {

        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getAllErrors().stream()
                    .map(DefaultMessageSourceResolvable::getDefaultMessage)
                    .collect(Collectors.toList());
            logger.error("Erreurs de validation : {}", errors);
            throw new MethodArgumentNotValidException(null, bindingResult);
        }   

        try {
            SubscriptionDetailsEntity renewedSubscription = subscriptionService.renewSubscription(id, renewalRequest.getRenewalPeriod(), renewalRequest.getUnit());
            return ResponseEntity.ok(renewedSubscription);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(null);
        }
    }

}