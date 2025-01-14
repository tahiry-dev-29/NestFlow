package com.nestflow.app.features.users.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nestflow.app.features.users.dto.UserUpdateRequest;
import com.nestflow.app.features.users.exceptions.ApiRep;
import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.service.UserService;
import static com.nestflow.app.features.users.exceptions.UserConstants.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

        private final UserService userService;
    
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
            return userService.getAll();
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
        @ApiResponses({
            @ApiResponse(responseCode = "200", description = SUCCESS_USER_UPDATED, content = @Content(schema = @Schema(implementation = UserEntity.class))),
            @ApiResponse(responseCode = "400", description = ERROR_INVALID_PARAMETERS, content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "404", description = ERROR_USER_NOT_FOUND, content = @Content(schema = @Schema(type = "string"))),
            @ApiResponse(responseCode = "500", description = SERVER_ERROR_MESSAGE, content = @Content(schema = @Schema(type = "string")))
        })
        public ResponseEntity<UserEntity> updateUser(@PathVariable String id, @RequestBody UserEntity updateRequest) {
            return userService.updateUser(id, updateRequest);
        }

    @PatchMapping("/update/{id}/images")
    @Operation(summary = "Mettre à jour l'image d'un utilisateur", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = SUCCESS_IMAGE_UPDATED, content = @Content(schema = @Schema(implementation = UserEntity.class))),
        @ApiResponse(responseCode = "400", description = ERROR_INVALID_PARAMETERS, content = @Content(schema = @Schema(type = "string"))),
        @ApiResponse(responseCode = "404", description = ERROR_USER_NOT_FOUND, content = @Content(schema = @Schema(type = "string"))),
        @ApiResponse(responseCode = "500", description = SERVER_ERROR_MESSAGE, content = @Content(schema = @Schema(type = "string")))
    })
    public ResponseEntity<UserEntity> updateImageUser(@PathVariable String id, @RequestPart("imageFile") MultipartFile imageFile) {
        return userService.updateImageUser(id, imageFile);
    }


    @PutMapping("/update/{id}/password")
    @Operation(summary = "Mettre à jour le mot de passe d'un utilisateur", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = SUCCESS_PASSWORD_UPDATED, content = @Content(schema = @Schema(implementation = UserEntity.class))),
        @ApiResponse(responseCode = "401", description = ERROR_UNAUTHORIZED_ACTION, content = @Content(schema = @Schema(type = "string"))),
        @ApiResponse(responseCode = "404", description = ERROR_USER_NOT_FOUND, content = @Content(schema = @Schema(type = "string"))),
        @ApiResponse(responseCode = "500", description = SERVER_ERROR_MESSAGE, content = @Content(schema = @Schema(type = "string")))
    })
    public ResponseEntity<UserEntity> updatePasswordUser(@PathVariable String id, @RequestBody UserUpdateRequest updateRequest) {
        return userService.updatePasswordUser(id, updateRequest);
    }

    

}