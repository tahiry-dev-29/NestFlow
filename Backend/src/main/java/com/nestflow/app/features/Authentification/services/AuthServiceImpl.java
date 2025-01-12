package com.nestflow.app.features.Authentification.services;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.nestflow.app.features.common.exceptions.UserServiceException;
import com.nestflow.app.features.security.JwtService;
import com.nestflow.app.features.security.TokenBlacklistService;
import com.nestflow.app.features.upload.services.ImageUploadService;
import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.repository.UserRepository;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageUploadService imageUploadService;
    

    @Override
    public ResponseEntity<UserEntity> signup(UserEntity user, MultipartFile imageFile) {
        try {
            validateUser(user);
            checkUserExists(user.getMail());
            encodePassword(user);

            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    String imageUrl = imageUploadService.uploadImage(imageFile);
                    user.setImageUrl(imageUrl);
                } catch (IOException e) {
                    log.error("Failed to upload image: ", e);
                    user.setImageUrl(null);
                }
            } else {
                user.setImageUrl(null);
            }

            UserEntity createdUser = userRepository.save(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (UserServiceException.UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            log.error("Error during user signup: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Override
    public ResponseEntity<Map<String, String>> login(UserEntity user, HttpServletResponse response) {
        try {
            Optional<UserEntity> userFound = userRepository.findByMail(user.getMail());

            if (userFound.isPresent() && passwordEncoder.matches(user.getPassword(), userFound.get().getPassword())) {
                UserEntity existingUser = userFound.get();

                UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                        existingUser.getMail(),
                        existingUser.getPassword(),
                        Collections.emptyList());
                String token = jwtService.generateToken(userDetails);

                Cookie cookie = new Cookie("Authorization", token);
                cookie.setHttpOnly(true);
                cookie.setSecure(false);
                cookie.setPath("/");
                cookie.setMaxAge(7 * 24 * 60 * 60);
                response.addCookie(cookie);

                existingUser.setOnline(true);
                userRepository.save(existingUser);

                Map<String, String> responseBody = new HashMap<>();
                responseBody.put("token", token);

                return ResponseEntity.ok(responseBody);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("error", "Invalid credentials."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }


    
    @Override
    public ResponseEntity<Map<String, String>> logout(String userId, HttpServletRequest request,
            HttpServletResponse response) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(
                            () -> new UserServiceException.UserNotFoundException("Utilisateur non trouvé : " + userId));

            user.setOnline(false);
            userRepository.save(user);

            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Token manquant ou invalide."));
            }

            String token = authHeader.substring(7);
            tokenBlacklistService.blacklistToken(token);

            Cookie cookie = new Cookie("Authorization", null);
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of("message", "Déconnexion réussie."));
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erreur interne du serveur."));
        }
    }

    @Override
    public ResponseEntity<UserEntity> getByToken() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String username = authentication.getName();

            Optional<UserEntity> userOptional = userRepository.findByMail(username);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            UserEntity user = userOptional.get();
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();

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
