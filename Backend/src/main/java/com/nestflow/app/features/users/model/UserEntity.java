package com.nestflow.app.features.users.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class UserEntity {
    @Id
    private String id;
    private String name;
    private String firstName;
    private String mail;
    private String password;
    private String imageUrl; // Champ pour l'URL de l'image (optionnel)
}