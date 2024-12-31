package com.nestflow.app.features.users.dto;

import com.nestflow.app.features.users.model.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateRequest {
    private UserEntity updatedUser;
    private String currentPassword;
    private String verificationPassword;
}