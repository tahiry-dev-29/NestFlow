package com.nestflow.app.features.users.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class UserEntity {
    @Id
    private String id;

    @NotNull(message = "Le nom est obligatoire.")
    private String name;

    @NotNull(message = "Le prénom est obligatoire.")
    private String firstName;

    @NotNull(message = "L'adresse email est obligatoire.")
    @Email(message = "L'adresse email doit être valide.")
    private String mail;

    @NotNull(message = "Le mot de passe est obligatoire.")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères.")
    private String password;

    private String imageUrl; // URL de l'image de profil

    private boolean online; // Supprimé "is" pour respecter les conventions Java
    private boolean active;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
