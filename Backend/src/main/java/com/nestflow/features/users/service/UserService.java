package com.nestflow.features.users.service;

import com.nestflow.features.users.dto.UserDTO;
import com.nestflow.features.users.mapper.UserMapper;
import com.nestflow.features.users.model.User;
import com.nestflow.features.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(String id) {
        Optional<User> userOptional = userRepository.findById(id);
        User user = userOptional.orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toDTO(user);
    }

    public UserDTO createUser(UserDTO userDTO) {
        User user = userMapper.toEntity(userDTO);
        User savedUser = userRepository.save(user);
        return userMapper.toDTO(savedUser);
    }

    public UserDTO updateUser(String id, UserDTO userDTO) {
        Optional<User> userOptional = userRepository.findById(id);
        User user = userOptional.orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(userDTO.getName());
        user.setFirstName(userDTO.getFirstName());
        user.setEmail(userDTO.getEmail());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setStatus(userDTO.getStatus());
        User updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public List<UserDTO> getUsersByStatus(String status) {
        return userRepository.findByStatus(status).stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByEmail(String email) {
        return userRepository.findByEmail(email).stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }
}