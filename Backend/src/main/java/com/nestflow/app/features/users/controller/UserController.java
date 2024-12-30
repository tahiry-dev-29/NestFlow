package com.nestflow.app.features.users.controller;

import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        if (signupRequest == null || signupRequest.getUser() == null) {
            return ResponseEntity.badRequest().body("Invalid request: user data is missing");
        }
        return userService.createUser(signupRequest.getUser(), signupRequest.getVerificationPassword());
    }

    @PostMapping("/getToken")
    public ResponseEntity<?> getToken(@RequestBody UserEntity user) {
        return userService.getToken(user);
    }

    @GetMapping("/lists")
    public ResponseEntity<?> listUsers() {
        return userService.getAll();
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        return userService.getPublicUserInfo(id);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        return userService.deleteUser(id);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest updateRequest) {
        return userService.updateUser(id, updateRequest);
    }

    @PostMapping("/logout/{id}")
    public ResponseEntity<?> logout(@PathVariable String id) {
        return userService.logout(id);
    }
}
