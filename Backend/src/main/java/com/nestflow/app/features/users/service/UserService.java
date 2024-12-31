package com.nestflow.app.features.users.service;

import com.nestflow.app.features.common.exceptions.UserServiceException;
import com.nestflow.app.features.users.controller.UserUpdateRequest;
import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.repository.UserRepository;
import com.nestflow.app.features.users.security.JwtService;
import com.nestflow.app.features.users.security.TokenBlacklistService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private ImageUploadService imageUploadService;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;


    public ResponseEntity<?> createUser(UserEntity user, MultipartFile imageFile) {

        try {
            validateUser(user);
            checkUserExists(user.getMail());
            encodePassword(user);
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = imageUploadService.uploadImage(imageFile);
                user.setImageUrl(imageUrl);
            }

            UserEntity createdUser = saveUser(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (UserServiceException.UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (UserServiceException.PasswordMismatchException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de l'inscription : " + e.getMessage());
        }
    }

    public ResponseEntity<?> getToken(UserEntity user) {
        try {
            if (user == null || user.getMail() == null) {
                return ResponseEntity.badRequest().body("Requête de connexion invalide.");
            }

            Optional<UserEntity> userFound = userRepository.findByMail(user.getMail());
            if (userFound.isPresent() && passwordEncoder.matches(user.getPassword(), userFound.get().getPassword())) {
                String email = userFound.get().getMail();
                UserDetails userDetails = new User(email, userFound.get().getPassword(), Collections.emptyList());
                String token = jwtService.generateToken(userDetails); // Pass UserDetails to generateToken
                UserEntity existingUser = userFound.get();
                existingUser.setOnline(true);
                userRepository.save(existingUser);

                return ResponseEntity.ok("Connexion réussie. Token : " + token);
            } else {
                throw new UserServiceException.InvalidCredentialsException();
            }
        } catch (UserServiceException.InvalidCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de la connexion : " + e.getMessage());
        }
    }

    private Optional<UserEntity> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getPrincipal().equals("anonymousUser")) {
            String userEmail = authentication.getName();
            return userRepository.findByMail(userEmail); // Retourne un Optional<UserEntity>
        }
        return Optional.empty();
    }

    public ResponseEntity<?> getAll() {
        try {
            Optional<UserEntity> currentUser = getCurrentUser();
            if (currentUser.isPresent()) {
                List<UserEntity> users = userRepository.findAll();
                List<Map<String, Object>> userListWithStatus = users.stream().map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("name", user.getName());
                    userMap.put("firstName", user.getFirstName());
                    userMap.put("mail", user.getMail());
                    userMap.put("imageUrl", user.getImageUrl());
                    userMap.put("isActive", user.isActive());
                    if (user.isOnline()) {
                        userMap.put("status", "online");
                    } else {
                        userMap.put("status", "offline");
                    }
                    return userMap;
                }).collect(Collectors.toList());
                return ResponseEntity.ok(userListWithStatus);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Vous devez être connecté pour voir les utilisateurs.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des utilisateurs : " + e.getMessage());
        }
    }

    public ResponseEntity<?> getPublicUserInfo(String userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));

            Map<String, Object> publicUserInfo = new HashMap<>();
            publicUserInfo.put("name", user.getName());
            publicUserInfo.put("firstName", user.getFirstName());
            publicUserInfo.put("imageUrl", user.getImageUrl());
            publicUserInfo.put("email", user.getMail()); // Si l'email est considéré comme public
            publicUserInfo.put("status", user.isOnline() ? "online" : "offline"); // Ajout du statut

            return ResponseEntity.ok(publicUserInfo);
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des informations publiques de l'utilisateur : "
                            + e.getMessage());
        }
    }

    public ResponseEntity<?> deleteUser(String userId) {
        try {
            userRepository.findById(userId).orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));
            userRepository.deleteById(userId);
            return ResponseEntity.ok("Utilisateur avec l'ID : " + userId + " supprimé avec succès.");
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            // Logging crucial ici
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de la suppression de l'utilisateur : " + e.getMessage());
        }
    }

    public ResponseEntity<?> updateUser(String userId, UserUpdateRequest updateRequest, MultipartFile imageFile) {
        try {
            Optional<UserEntity> existingUserOpt = userRepository.findById(userId);
            UserEntity existingUser = existingUserOpt
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));

            if (!passwordEncoder.matches(updateRequest.getCurrentPassword(), existingUser.getPassword())) {
                throw new UserServiceException.CurrentPasswordIncorrectException();
            }

            UserEntity updatedUser = updateRequest.getUpdatedUser();

            existingUser.setName(updatedUser.getName());
            existingUser.setFirstName(updatedUser.getFirstName());
            existingUser.setMail(updatedUser.getMail());

            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = imageUploadService.uploadImage(imageFile);
                existingUser.setImageUrl(imageUrl);
            }

            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                try {
                    validatePasswords(updatedUser.getPassword(), updateRequest.getVerificationPassword()); 
                    existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
                } catch (UserServiceException.PasswordMismatchException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Les nouveaux mots de passe ne correspondent pas."); 
                }
            }

            UserEntity savedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(savedUser);
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UserServiceException.CurrentPasswordIncorrectException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de la mise à jour de l'utilisateur : " + e.getMessage());
        }
    }

    private void validateUser(UserEntity user) {
        if (user == null) {
            throw new IllegalArgumentException("L'utilisateur ne peut pas être null.");
        }

        if (user.getMail() == null) {
            throw new IllegalArgumentException("L'email de l'utilisateur ne peut pas être null.");
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

    public ResponseEntity<?> logout(String userId, HttpServletRequest request, HttpServletResponse response) {
        try {
            Optional<UserEntity> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                UserEntity user = userOptional.get();
                user.setOnline(false);
                userRepository.save(user);

                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String jwt = authHeader.substring(7);
                    tokenBlacklistService.blacklistToken(jwt);
                }

                String cookieValue = "jwt-token=; Max-Age=0; HttpOnly; Path=/; Secure; SameSite=Lax; Domain=localhost";
                response.setHeader("Set-Cookie", cookieValue);

                return ResponseEntity.ok("Déconnexion réussie pour l'utilisateur : " + userId);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de la déconnexion : " + e.getMessage());
        }
    }

    private UserEntity saveUser(UserEntity user) {
        return userRepository.save(user);
    }

    private void validatePasswords(String password, String verificationPassword) {
        if (!password.equals(verificationPassword)) {
            throw new UserServiceException.PasswordMismatchException();
        }
    }
}