package com.nestflow.app.features.users.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.nestflow.app.features.users.dto.UserUpdateRequest;
import com.nestflow.app.features.users.model.UserEntity;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface UserService {

    ResponseEntity<UserEntity> createUser(UserEntity user, MultipartFile imageFile);

    ResponseEntity<Map<String, String>> login(UserEntity user, HttpServletResponse response);

    ResponseEntity<UserEntity> getByToken();

    ResponseEntity<List<Map<String, Object>>> getAll();

    ResponseEntity<Map<String, Object>> getPublicUserInfo(String userId);

    ResponseEntity<String> deleteUser(String userId);

    ResponseEntity<UserEntity> updateUser(String userId, UserUpdateRequest updateRequest, MultipartFile imageFile);

    ResponseEntity<Map<String, String>> logout(String userId, HttpServletRequest request, HttpServletResponse response);
}