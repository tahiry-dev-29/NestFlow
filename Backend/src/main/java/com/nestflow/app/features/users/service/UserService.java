package com.nestflow.app.features.users.service;

import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.controller.UserUpdateRequest;
import com.nestflow.app.features.users.exceptions.UserAlreadyExistsException;
import com.nestflow.app.exception.PasswordMismatchException;
import com.nestflow.app.features.users.repository.UserRepository;
import com.nestflow.app.features.users.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ResponseEntity<?> createUser(UserEntity user, String verificationPassword) {
        try {
            validateUser(user);
            checkUserExists(user.getMail());
            validatePasswords(user.getPassword(), verificationPassword);
            encodePassword(user);
            UserEntity createdUser = saveUser(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during signup: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getToken(UserEntity user) {
        try {
            if (user == null || user.getMail() == null) {
                return ResponseEntity.badRequest().body("Invalid login request");
            }
            Optional<UserEntity> userFound = userRepository.findByMail(user.getMail());
            if (userFound.isPresent() && passwordEncoder.matches(user.getPassword(), userFound.get().getPassword())) {
                String token = jwtService.generateToken(user.getMail());
                return ResponseEntity.ok("Login successful. Token: " + token);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during login: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getAll() {
        try {
            List<UserEntity> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while retrieving users: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getUser(String userId) {
        try {
            Optional<UserEntity> user = userRepository.findById(userId);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User with ID: " + userId + " does not exist");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while retrieving the user: " + e.getMessage());
        }
    }

    public ResponseEntity<?> deleteUser(String userId) {
        try {
            Optional<UserEntity> userToDelete = userRepository.findById(userId);
            if (userToDelete.isPresent()) {
                userRepository.deleteById(userId);
                return ResponseEntity.ok("User with ID: " + userId + " deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User with ID: " + userId + " does not exist");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while deleting the user: " + e.getMessage());
        }
    }

    public ResponseEntity<?> updateUser(String userId, UserUpdateRequest updateRequest) {
        try {
            Optional<UserEntity> existingUserOpt = userRepository.findById(userId);
            if (existingUserOpt.isPresent()) {
                UserEntity existingUser = existingUserOpt.get();
                if (!passwordEncoder.matches(updateRequest.getCurrentPassword(), existingUser.getPassword())) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Current password is incorrect");
                }
                UserEntity updatedUser = updateRequest.getUpdatedUser();
                existingUser.setName(updatedUser.getName());
                existingUser.setFirstName(updatedUser.getFirstName());
                existingUser.setMail(updatedUser.getMail());
                existingUser.setImageUrl(updatedUser.getImageUrl());
                if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                    existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                }
                UserEntity savedUser = userRepository.save(existingUser);
                return ResponseEntity.ok(savedUser);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating the user: " + e.getMessage());
        }
    }
    
    private void validateUser(UserEntity user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        if (user.getMail() == null) {
            throw new IllegalArgumentException("User email cannot be null");
        }
    }

    private void checkUserExists(String email) {
        if (userRepository.findByMail(email).isPresent()) {
            throw new UserAlreadyExistsException("User with this email already exists");
        }
    }

    private void validatePasswords(String password, String verificationPassword) {
        if (!password.equals(verificationPassword)) {
            throw new PasswordMismatchException("Passwords do not match");
        }
    }

    private void encodePassword(UserEntity user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
    }

    private UserEntity saveUser(UserEntity user) {
        return userRepository.save(user);
    }
}