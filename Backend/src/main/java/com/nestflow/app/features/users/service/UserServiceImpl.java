package com.nestflow.app.features.users.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.nestflow.app.features.common.exceptions.UserServiceException;
import com.nestflow.app.features.upload.services.ImageUploadService;
import com.nestflow.app.features.users.dto.UserUpdateRequest;
import com.nestflow.app.features.users.exceptions.ApiRep;
import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageUploadService imageUploadService;

    @Override
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        try {
            List<UserEntity> users = userRepository.findAll();
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("firstName", user.getFirstName());
                userMap.put("mail", user.getMail());
                userMap.put("role", user.getRole());
                userMap.put("imageUrl", user.getImageUrl());
                userMap.put("online", user.isOnline());
                return userMap;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(userList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> getPublicUserInfo(String userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));
            Map<String, Object> publicInfo = new HashMap<>();
            publicInfo.put("name", user.getName());
            publicInfo.put("imageUrl", user.getImageUrl());
            publicInfo.put("mail", user.getMail());
            publicInfo.put("online", user.isOnline());
            return ResponseEntity.ok(publicInfo);
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Override
    public ResponseEntity<ApiRep> deleteUser(String userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));

            userRepository.delete(user);

            ApiRep response = new ApiRep("User deleted successfully.", true);
            return ResponseEntity.ok(response);
        } catch (UserServiceException.UserNotFoundException e) {
            ApiRep response = new ApiRep(e.getMessage(), false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            ApiRep response = new ApiRep("Error: " + e.getMessage(), false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /* Mise à jour de l'image de l'utilisateur */
    @Override
    public ResponseEntity<UserEntity> updateImageUser(String userId, MultipartFile imageFile) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));

            if (imageFile != null && !imageFile.isEmpty()) {
                user.setImageUrl(imageUploadService.uploadImage(imageFile));
            } else {
                throw new IllegalArgumentException("Fichier image invalide ou absent.");
            }

            return ResponseEntity.ok(userRepository.save(user));
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /* Mise à jour des informations utilisateur */
    @Override
public ResponseEntity<UserEntity> updateUser(String userId, UserEntity updateRequest) {
    try {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));

        // Mise à jour conditionnelle des champs
        Optional.ofNullable(updateRequest.getName()).ifPresent(user::setName);
        Optional.ofNullable(updateRequest.getFirstName()).ifPresent(user::setFirstName);
        Optional.ofNullable(updateRequest.getMail()).ifPresent(user::setMail);
        Optional.ofNullable(updateRequest.getRole()).ifPresent(user::setRole);

        // Sauvegarde de l'utilisateur mis à jour
        UserEntity updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    } catch (UserServiceException.UserNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}


    /* Mise à jour du mot de passe utilisateur */
    @Override
    public ResponseEntity<UserEntity> updatePasswordUser(String userId, UserUpdateRequest updateRequest) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));

            if (!passwordEncoder.matches(updateRequest.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            Optional.ofNullable(updateRequest.getUpdatedUser().getPassword())
                    .ifPresent(password -> user.setPassword(passwordEncoder.encode(password)));

            return ResponseEntity.ok(userRepository.save(user));
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
