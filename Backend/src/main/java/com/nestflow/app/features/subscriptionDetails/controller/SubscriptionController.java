package com.nestflow.app.features.subscriptionDetails.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
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

import com.nestflow.app.features.subscriptionDetails.dto.RenewalRequest;
import com.nestflow.app.features.subscriptionDetails.dto.SubscriptionWithDetailsResponse;
import com.nestflow.app.features.subscriptionDetails.model.SubscriptionDetailsEntity;
import com.nestflow.app.features.subscriptionDetails.services.SubscriptionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/subscriptions")
@Tag(name = "Abonnements", description = "Gestion des abonnements")
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT")
public class SubscriptionController {

        @Autowired
        private SubscriptionService subscriptionService;

        @PostMapping("/add")
        @Operation(summary = "Créer un nouvel abonnement", security = @SecurityRequirement(name = "bearerAuth"))
        @PreAuthorize("hasRole('ADMIN')")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Abonnement créé avec succès", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubscriptionDetailsEntity.class))),
                        @ApiResponse(responseCode = "400", description = "Paramètres de requête incorrects")
        })
        public ResponseEntity<SubscriptionDetailsEntity> createSubscription(
                        @RequestBody SubscriptionDetailsEntity details) {
                SubscriptionDetailsEntity created = subscriptionService.createSubscription(details);
                return ResponseEntity.ok(created);
        }

        @GetMapping("/get/{id}")
        @Operation(summary = "Obtenir les informations d'un abonnement par son ID", security = @SecurityRequirement(name = "bearerAuth"))
        @PreAuthorize("hasRole('ADMIN')")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Informations de l'abonnement", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubscriptionDetailsEntity.class))),
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

        @GetMapping("/getAll/withDetails")
        @Operation(summary = "Obtenir tous les abonnements avec les détails et le statut", security = @SecurityRequirement(name = "bearerAuth"))
        @PreAuthorize("hasRole('ADMIN')")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Liste des abonnements avec les détails et le statut", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubscriptionWithDetailsResponse.class))),
                        @ApiResponse(responseCode = "403", description = "Accès interdit"),
                        @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
        })
        public ResponseEntity<List<SubscriptionWithDetailsResponse>> getAllSubscriptionsWithDetails() {
                try {
                        List<SubscriptionWithDetailsResponse> subscriptionsWithDetails = subscriptionService
                                        .getAllSubscriptionsWithDetails();
                        return ResponseEntity.ok(subscriptionsWithDetails);
                } catch (IllegalStateException e) {
                        return ResponseEntity.badRequest().body(null);
                } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
                }
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
                        BindingResult bindingResult) {

                if (bindingResult.hasErrors()) {
                        return ResponseEntity.badRequest().body(null);
                }
                try {
                        SubscriptionDetailsEntity renewedSubscription = subscriptionService.renewSubscription(id,
                                        renewalRequest);
                        return ResponseEntity.ok(renewedSubscription);
                } catch (ResponseStatusException e) {
                        return ResponseEntity.status(e.getStatusCode()).body(null);
                }
        }
}