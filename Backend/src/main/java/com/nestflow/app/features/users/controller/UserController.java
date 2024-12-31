package com.nestflow.app.features.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nestflow.app.features.users.model.UserEntity;
import com.nestflow.app.features.users.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createUser(
        @RequestParam("name") String name,
        @RequestParam("firstName") String firstName,
        @RequestParam("mail") String mail,
        @RequestParam("password") String password,
        @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        
        UserEntity user = new UserEntity();
        user.setName(name);
        user.setFirstName(firstName);
        user.setMail(mail);
        user.setPassword(password);
        
        return userService.createUser(user, imageFile);
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
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest updateRequest, 
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {
        return userService.updateUser(id, updateRequest, imageFile);
    }

    @PostMapping("/logout/{id}")
    public ResponseEntity<?> logout(@PathVariable String id, HttpServletRequest request, HttpServletResponse response) {
        return userService.logout(id, request, response);
    }
}
