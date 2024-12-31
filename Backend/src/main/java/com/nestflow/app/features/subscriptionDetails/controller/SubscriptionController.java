package com.nestflow.app.features.subscriptionDetails.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionStatusResponse;
import com.nestflow.app.features.subscriptionDetails.service.SubscriptionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.media.Content; // Import Content
import io.swagger.v3.oas.annotations.media.Schema; // Import Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/subscriptions")
@Tag(name = "Abonnements", description = "Gestion des abonnements")
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT")
public class SubscriptionController {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionService.class);

    @Autowired
    private SubscriptionService subscriptionService;

    @PostMapping("/add")
    @Operation(summary = "Créer un nouvel abonnement", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Abonnement créé avec succès",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SubscriptionDetailsEntity.class))),
            @ApiResponse(responseCode = "400", description = "Paramètres de requête incorrects")
    })
    public ResponseEntity<SubscriptionDetailsEntity> createSubscription(
            @RequestBody SubscriptionDetailsEntity details) {
        SubscriptionDetailsEntity created = subscriptionService.createSubscription(details);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/lists")
    @Operation(summary = "Obtenir la liste de tous les abonnements", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')") // Assuming role-based authorization
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des abonnements")
    })
    public ResponseEntity<List<SubscriptionDetailsEntity>> getAllSubscriptions() {
        List<SubscriptionDetailsEntity> subscriptions = subscriptionService.getAllSubscriptions();
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/get/{id}")
    @Operation(summary = "Obtenir les informations d'un abonnement par son ID", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Informations de l'abonnement",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SubscriptionDetailsEntity.class))),
                            @ApiResponse(responseCode = "404", description = "Abonnement non trouvé")
    })
    public ResponseEntity<SubscriptionDetailsEntity> getSubscriptionById(@PathVariable String id) {
        SubscriptionDetailsEntity subscription = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(subscription);
    }

    @PutMapping("/update/{id}")
    @Operation(summary = "Mettre à jour un abonnement", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Abonnement mis à jour avec succès", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubscriptionDetailsEntity.class))),
            @ApiResponse(responseCode = "400", description = "Requête incorrecte"),
            @ApiResponse(responseCode = "404", description = "Abonnement non trouvé")
    })
    public ResponseEntity<SubscriptionDetailsEntity> updateSubscription(@PathVariable String id,
            @RequestBody SubscriptionDetailsEntity details) {
        SubscriptionDetailsEntity updated = subscriptionService.updateSubscription(id, details);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Supprimer un abonnement", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Abonnement supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Abonnement non trouvé")
    })
    public ResponseEntity<Void> deleteSubscription(@PathVariable String id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/get/{id}/status")
    @Operation(summary = "Obtenir le statut d'un abonnement", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statut de l'abonnement", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubscriptionStatusResponse.class))),
            @ApiResponse(responseCode = "404", description = "Abonnement non trouvé")
    })
    public Mono<ResponseEntity<SubscriptionStatusResponse>> getSubscriptionStatus(@PathVariable String id) {
        return subscriptionService.getSubscriptionStatus(id)
                .map(status -> ResponseEntity.ok(status))
                .onErrorResume(ResponseStatusException.class,
                        e -> Mono.just(ResponseEntity.status(e.getStatusCode()).build()));
    }

    @PatchMapping("/set/{id}/renew")
    @Operation(summary = "Renouveler un abonnement", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Abonnement renouvelé avec succès", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubscriptionDetailsEntity.class))),
            @ApiResponse(responseCode = "400", description = "Requête incorrecte"),
            @ApiResponse(responseCode = "404", description = "Abonnement non trouvé")
    })
    public ResponseEntity<SubscriptionDetailsEntity> renewSubscription(
            @PathVariable String id,
            @Valid @RequestBody RenewalRequest renewalRequest,
                    BindingResult bindingResult) throws MethodArgumentNotValidException {

            if (bindingResult.hasErrors()) {
                    List<String> errors = bindingResult.getAllErrors().stream()
                                    .map(DefaultMessageSourceResolvable::getDefaultMessage)
                                    .collect(Collectors.toList());
                    logger.error("Erreurs de validation : {}", errors);
                    return ResponseEntity.badRequest().body(null);
            }

            try {
                    SubscriptionDetailsEntity renewedSubscription = subscriptionService.renewSubscription(
                                    id,
                                    renewalRequest.getRenewalPeriod(),
                                    renewalRequest.getUnit(),
                                    renewalRequest);
                    return ResponseEntity.ok(renewedSubscription);
            } catch (ResponseStatusException e) {
                    return ResponseEntity.status(e.getStatusCode()).body(null);
            }
    }

}