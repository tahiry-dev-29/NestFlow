package com.nestflow.app.features.users.controller;

import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.service.UserService;
import com.nestflow.app.features.users.security.JwtService;
import com.nestflow.app.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            if (signupRequest == null || signupRequest.getUser() == null) {
                return ResponseEntity.badRequest().body("Invalid request: user data is missing");
            }
            UserEntity createdUser = userService.createUser(signupRequest.getUser(), signupRequest.getVerificationPassword());
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during signup: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserEntity user) {
        try {
            if (user == null || user.getMail() == null) {
                return ResponseEntity.badRequest().body("Invalid login request");
            }
            Optional<UserEntity> userFound = userRepository.findByMail(user.getMail());
            if (userFound.isPresent() && passwordEncoder.matches(user.getPassword(), userFound.get().getPassword())) {
                String token = jwtService.generateToken(user.getMail());
                return ResponseEntity.ok(token);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred during login: " + e.getMessage());
        }
    }
}
