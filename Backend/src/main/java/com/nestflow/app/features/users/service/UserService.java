package com.nestflow.app.features.users.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.nestflow.app.features.users.dto.UserUpdateRequest;
import com.nestflow.app.features.users.exceptions.ApiRep;
import com.nestflow.app.features.users.model.UserEntity;

public interface UserService {

    ResponseEntity<List<Map<String, Object>>> getAll();

    ResponseEntity<Map<String, Object>> getPublicUserInfo(String userId);

    ResponseEntity<ApiRep> deleteUser(String userId);

    ResponseEntity<UserEntity> updateImageUser(String userId, MultipartFile imageFile);

    ResponseEntity<UserEntity> updatePasswordUser(String userId, UserUpdateRequest updateRequest);

    ResponseEntity<UserEntity> updateUser(String userId, UserEntity updateRequest);
}