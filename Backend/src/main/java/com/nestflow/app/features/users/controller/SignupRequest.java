package com.nestflow.app.features.users.controller;

import com.nestflow.app.features.users.model.UserEntity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignupRequest {
    private UserEntity user;
    private String verificationPassword;
}
