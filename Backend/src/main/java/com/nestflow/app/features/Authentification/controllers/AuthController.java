package com.nestflow.app.features.Authentification.controllers;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nestflow.app.features.Authentification.services.AuthService;
import com.nestflow.app.features.upload.services.ImageUploadService;
import com.nestflow.app.features.users.model.UserEntity;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Créer un nouvel utilisateur")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
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
        user.setName(name);
        user.setFirstName(firstName);
        user.setMail(mail);
        user.setPassword(password);
        user.setImageUrl(null);

        try {
            UserEntity.ROLE role = UserEntity.ROLE.valueOf(roleString.toUpperCase());
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        return authService.signup(user, imageFile);
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
        return authService.login(user, response);
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
        return authService.getByToken();
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
        return authService.logout(id, request, response);
    }

    @GetMapping("/api/users/images/upload/{filename}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path imagePath = Paths.get("uploads").resolve(filename);
            Resource resource = new UrlResource(imagePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
