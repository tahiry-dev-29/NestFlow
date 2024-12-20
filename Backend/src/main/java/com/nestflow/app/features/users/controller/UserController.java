package com.nestflow.app.features.users.controller;

import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.service.UserService;
import com.nestflow.app.features.users.security.JwtService;
import com.nestflow.app.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<UserEntity> signup(@RequestBody SignupRequest signupRequest) {
        UserEntity createdUser = userService.createUser(signupRequest.getUser(), signupRequest.getVerificationPassword());
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody UserEntity user) {
        Optional<UserEntity> userFound = userRepository.findByMail(user.getMail());
        if (userFound.isPresent() && passwordEncoder.matches(user.getPassword(), userFound.get().getPassword())) {
            String token = jwtService.generateToken(user.getMail());
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
