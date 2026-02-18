package com.crms.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.crms.model.User;
import com.crms.model.UserStatus;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByRoleAndDepartment(com.crms.model.Role role, String department);

    List<User> findByStatus(UserStatus status);
}
