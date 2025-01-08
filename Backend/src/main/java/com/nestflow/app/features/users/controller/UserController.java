package com.nestflow.app.features.users.controller;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nestflow.app.features.users.dto.UserUpdateRequest;
import com.nestflow.app.features.users.exceptions.ApiRep;
import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.service.ImageUploadService;
import com.nestflow.app.features.users.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final ImageUploadService imageUploadService;


    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Créer un nouvel utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Utilisateur créé avec succès", content = @Content(schema = @Schema(implementation = UserEntity.class))),
            @ApiResponse(responseCode = "400", description = "Paramètres de requête incorrects", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "409", description = "Utilisateur déjà existant", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "500", description = "Erreur interne du serveur", content = @Content(schema = @Schema(type = "string")))
    })
    public ResponseEntity<UserEntity> createUser(
            @RequestParam("name") String name,
            @RequestParam("firstName") String firstName,
            @RequestParam("mail") String mail,
            @RequestParam("password") String password,
            @RequestParam("role") String roleString,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        UserEntity user = new UserEntity();
        String imagePath;
        try {
            imagePath = imageUploadService.uploadImage(imageFile);
        } catch (IOException e) {
            imagePath = null;
        }
        user.setName(name);
        user.setFirstName(firstName);
        user.setMail(mail);
        user.setPassword(password);
        if (imagePath != null) {
            user.setImageUrl(imagePath);  // Store just the filename
        } else {
            user.setImageUrl(null);
        }



        try {
            UserEntity.ROLE role = UserEntity.ROLE.valueOf(roleString.toUpperCase());
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        return userService.signup(user, imageFile);
    }

    
    @PostMapping(value = "/login")
    @Operation(summary = "Obtenir un jeton d'authentification")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Jeton d'authentification renvoyé avec succès"),
            @ApiResponse(responseCode = "400", description = "Requête invalide"),
            @ApiResponse(responseCode = "401", description = "Identifiants invalides"),
            @ApiResponse(responseCode = "500", description = "Erreur interne")
    })
    public ResponseEntity<?> login(
            @RequestBody(required = false) UserEntity user,
            HttpServletResponse response) {

        if (user == null || user.getMail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("error", "Requête invalide : email ou mot de passe manquant."));
        }
        return userService.login(user, response);
    }

    @GetMapping("/me")
    @Operation(summary = "Récupérer les informations de l'utilisateur connecté", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Informations de l'utilisateur récupérées avec succès", content = @Content(schema = @Schema(implementation = UserEntity.class))),
            @ApiResponse(responseCode = "401", description = "Non autorisé (token invalide ou manquant)", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "500", description = "Erreur interne du serveur", content = @Content(schema = @Schema(type = "string")))
    })
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserEntity> getCurrentUser() {
        return userService.getByToken();
    }

    @GetMapping("/lists")
    @Operation(summary = "Obtenir la liste de tous les utilisateurs", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des utilisateurs", content = @Content(array = @ArraySchema(schema = @Schema(implementation = Map.class)))),
            @ApiResponse(responseCode = "401", description = "Non authentifié", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "403", description = "Accès interdit", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "500", description = "Erreur interne du serveur", content = @Content(schema = @Schema(type = "string")))
    })
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        return userService.getAll(); // Type corrigé
    }

    @GetMapping("/get/{id}")
    @Operation(summary = "Obtenir les informations publiques d'un utilisateur", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Informations publiques de l'utilisateur", content = @Content(schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "500", description = "Erreur interne du serveur", content = @Content(schema = @Schema(type = "string")))
    })
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String id) {
        return userService.getPublicUserInfo(id);
    }

    @DeleteMapping("/delete/{id}")
    @Operation(summary = "Supprimer un utilisateur", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur supprimé avec succès", content = @Content(schema = @Schema(type = "object", implementation = ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content(schema = @Schema(type = "object", implementation = ApiResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erreur interne du serveur", content = @Content(schema = @Schema(type = "object", implementation = ApiResponse.class)))
    })
    public ResponseEntity<ApiRep> deleteUser(@PathVariable String id) {
        return userService.deleteUser(id);
    }

    @PatchMapping("/update/{id}")
    @Operation(summary = "Mettre à jour un utilisateur", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur mis à jour avec succès", content = @Content(schema = @Schema(implementation = UserEntity.class))),
            @ApiResponse(responseCode = "400", description = "Paramètres de requête incorrects", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "401", description = "Mot de passe actuel incorrect", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "500", description = "Erreur interne du serveur", content = @Content(schema = @Schema(type = "string")))
    })
    public ResponseEntity<UserEntity> updateUser(@PathVariable String id,
            @RequestBody UserUpdateRequest updateRequest,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        return (ResponseEntity<UserEntity>) userService.updateUser(id, updateRequest, imageFile);
    }

    @PostMapping("/logout/{id}")
    @Operation(summary = "Se déconnecter", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("isAuthenticated()")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Déconnecté avec succès", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "400", description = "Token manquant ou invalide", content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "500", description = "Erreur interne du serveur", content = @Content(schema = @Schema(type = "string")))
    })
    public ResponseEntity<Map<String, String>> logout(@PathVariable String id, HttpServletRequest request,
            HttpServletResponse response) {
        return userService.logout(id, request, response);
    }
}