package com.nestflow.app.features.users.service;

import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.exceptions.UserAlreadyExistsException;
import com.nestflow.app.exception.PasswordMismatchException;
import com.nestflow.app.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity createUser(UserEntity user, String verificationPassword) {
        if (userRepository.findByMail(user.getMail()).isPresent()) {
            throw new UserAlreadyExistsException("User with this email already exists");
        }

        if (!user.getPassword().equals(verificationPassword)) {
            throw new PasswordMismatchException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}