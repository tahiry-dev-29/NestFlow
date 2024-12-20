package com.nestflow.app.features.users.controller;

import com.nestflow.app.features.users.model.UserEntity;

public class SignupRequest {
    private UserEntity user;
    private String verificationPassword;

    public SignupRequest() {}

    public SignupRequest(UserEntity user, String verificationPassword) {
        this.user = user;
        this.verificationPassword = verificationPassword;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public String getVerificationPassword() {
        return verificationPassword;
    }

    public void setVerificationPassword(String verificationPassword) {
        this.verificationPassword = verificationPassword;
    }
}
