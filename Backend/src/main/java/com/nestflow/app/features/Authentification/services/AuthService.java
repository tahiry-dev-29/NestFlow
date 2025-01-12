package com.nestflow.app.features.Authentification.services;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import com.nestflow.app.features.users.model.UserEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    
    ResponseEntity<UserEntity> signup(UserEntity user, MultipartFile imageFile);

    ResponseEntity<Map<String, String>> login(UserEntity user, HttpServletResponse response);

    ResponseEntity<Map<String, String>> logout(String userId, HttpServletRequest request, HttpServletResponse response);

    ResponseEntity<UserEntity> getByToken();
}
