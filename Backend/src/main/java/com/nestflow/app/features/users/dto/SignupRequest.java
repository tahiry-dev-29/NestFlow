package com.nestflow.app.features.users.dto;

import org.springframework.web.multipart.MultipartFile;

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
    private MultipartFile profilePicture;
}
