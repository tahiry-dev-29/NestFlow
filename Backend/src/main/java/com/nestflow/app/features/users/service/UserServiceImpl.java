package com.nestflow.app.features.users.service;

import com.nestflow.app.features.common.exceptions.UserServiceException;
import com.nestflow.app.features.users.dto.UserUpdateRequest;
import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.repository.UserRepository;
import com.nestflow.app.features.users.security.JwtService;
import com.nestflow.app.features.users.security.TokenBlacklistService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final ImageUploadService imageUploadService;

    @Override
    public ResponseEntity<UserEntity> createUser(UserEntity user, MultipartFile imageFile) {
        try {
            validateUser(user);
            checkUserExists(user.getMail());
            encodePassword(user);
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = imageUploadService.uploadImage(imageFile);
                user.setImageUrl(imageUrl);
            }
            UserEntity createdUser = userRepository.save(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (UserServiceException.UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Override
    public ResponseEntity<String> getToken(UserEntity user) {
        try {
            Optional<UserEntity> userFound = userRepository.findByMail(user.getMail());
            if (userFound.isPresent() && passwordEncoder.matches(user.getPassword(), userFound.get().getPassword())) {
                UserEntity existingUser = userFound.get();

                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                        existingUser.getMail(),
                        existingUser.getPassword(),
                        Collections.emptyList());

                String token = jwtService.generateToken(userDetails);

                existingUser.setOnline(true);
                userRepository.save(existingUser);

                return ResponseEntity.ok("Token : " + token);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        try {
            List<UserEntity> users = userRepository.findAll();
            List<Map<String, Object>> userList = users.stream().map(user -> {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", user.getId());
                userMap.put("name", user.getName());
                userMap.put("mail", user.getMail());
                userMap.put("status", user.isOnline() ? "online" : "offline");
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
            publicInfo.put("status", user.isOnline() ? "online" : "offline");
            return ResponseEntity.ok(publicInfo);
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Override
    public ResponseEntity<String> deleteUser(String userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));
            userRepository.delete(user);
            return ResponseEntity.ok("User deleted successfully.");
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @Override
    public ResponseEntity<UserEntity> updateUser(String userId, UserUpdateRequest updateRequest,
            MultipartFile imageFile) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));

            if (!passwordEncoder.matches(updateRequest.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            Optional<String> newName = Optional.ofNullable(updateRequest.getUpdatedUser().getName());
            newName.ifPresent(user::setName);

            Optional<String> newMail = Optional.ofNullable(updateRequest.getUpdatedUser().getMail());
            newMail.ifPresent(user::setMail);

            if (imageFile != null && !imageFile.isEmpty()) {
                user.setImageUrl(imageUploadService.uploadImage(imageFile));
            }

            Optional<String> newPassword = Optional.ofNullable(updateRequest.getUpdatedUser().getPassword());
            newPassword.ifPresent(password -> user.setPassword(passwordEncoder.encode(password)));
            UserEntity updatedUser = userRepository.save(user);

            return ResponseEntity.ok(updatedUser);
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @Override
    public ResponseEntity<String> logout(String userId, HttpServletRequest request, HttpServletResponse response) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));
            user.setOnline(false);
            userRepository.save(user);
            String token = request.getHeader("Authorization").substring(7);
            tokenBlacklistService.blacklistToken(token);
            return ResponseEntity.ok("Logout successful.");
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }



    private void validateUser(UserEntity user) {
        if (user.getMail() == null || user.getMail().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty.");
        }
    }

    private void checkUserExists(String email) {
        if (userRepository.findByMail(email).isPresent()) {
            throw new UserServiceException.UserAlreadyExistsException(email);
        }
    }

    private void encodePassword(UserEntity user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
    }
}
