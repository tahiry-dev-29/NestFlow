package com.nestflow.features.users.model;

import lombok.Data;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String firstName;
    private String email;
    private String phoneNumber;
    private String password;
    private String status;
}
