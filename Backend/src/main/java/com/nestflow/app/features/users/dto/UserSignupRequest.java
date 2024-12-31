package com.nestflow.app.features.users.dto;

import lombok.Data;

@Data
public class UserSignupRequest {
    private String name;
    private String firstName;
    private String mail;
    private String password;
}