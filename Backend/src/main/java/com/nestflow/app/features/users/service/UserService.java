package com.nestflow.app.features.users.service;

import com.nestflow.app.features.common.exceptions.UserServiceException;
import com.nestflow.app.features.users.controller.UserUpdateRequest;
import com.nestflow.app.features.users.model.UserEntity;
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
        } catch (UserServiceException.UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (UserServiceException.PasswordMismatchException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            // Logging important ici !
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
                String token = jwtService.generateToken(user.getMail());
                return ResponseEntity.ok("Connexion réussie. Token : " + token);
            } else {
                throw new UserServiceException.InvalidCredentialsException(); // Utilisation de l'exception spécifique
            }
        } catch (UserServiceException.InvalidCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de la connexion : " + e.getMessage());
        }
    }

    public ResponseEntity<?> getAll() {
        try {
            List<UserEntity> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            // Logging crucial ici pour diagnostiquer l'erreur
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de la récupération des utilisateurs : " + e.getMessage());
        }
    }

    public ResponseEntity<?> getUser(String userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserServiceException.UserNotFoundException(userId));
            return ResponseEntity.ok(user);
        } catch (UserServiceException.UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            // Logging crucial ici
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de la récupération de l'utilisateur : " + e.getMessage());
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

    public ResponseEntity<?> updateUser(String userId, UserUpdateRequest updateRequest) {
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
            existingUser.setImageUrl(updatedUser.getImageUrl());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
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

    private void validatePasswords(String password, String verificationPassword) {
        if (!password.equals(verificationPassword)) {
            throw new UserServiceException.PasswordMismatchException();
        }
    }

    private void encodePassword(UserEntity user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
    }

    private UserEntity saveUser(UserEntity user) {
        return userRepository.save(user);
    }
}