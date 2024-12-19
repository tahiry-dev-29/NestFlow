package com.nestflow.features.users.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.nestflow.features.users.model.User;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {

    List<User> findByStatus(String status);

    List<User> findByEmail(String email);

}