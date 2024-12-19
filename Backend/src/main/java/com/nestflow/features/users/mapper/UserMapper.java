package com.nestflow.features.users.mapper;

import com.nestflow.features.users.model.User;
import org.springframework.stereotype.Component;
import com.nestflow.features.users.dto.UserDTO;

@Component
public class UserMapper {
    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhoneNumber(user.getPhoneNumber());
        userDTO.setStatus(user.getStatus());
        return userDTO;
    }

    public User toEntity(UserDTO userDTO) {
        if (userDTO == null) {
            return null;
        }
        User user = new User();
        user.setId(userDTO.getId());
        user.setName(userDTO.getName());
        user.setFirstName(userDTO.getFirstName());
        user.setEmail(userDTO.getEmail());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setStatus(userDTO.getStatus());
        return user;
    }   
}
