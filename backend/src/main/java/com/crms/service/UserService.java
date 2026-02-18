package com.crms.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.crms.dto.request.SignupRequest;
import com.crms.model.Role;
import com.crms.model.User;
import com.crms.model.UserStatus;
import com.crms.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public List<User> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status);
    }

    public User createUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.STUDENT);
        user.setStatus(UserStatus.ACTIVE);
        user.setDepartment(request.getDepartment());

        return userRepository.save(user);
    }

    public User updateUser(String id, SignupRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (request.getEmail() != null && !request.getEmail().isEmpty()
                && !user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Error: Email is already in use!");
            }
            user.setEmail(request.getEmail());
        }

        user.setName(request.getName());
        user.setPhone(request.getPhone());

        // Only update password if provided and not empty
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(encoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }

        return userRepository.save(user);
    }

    private String resolveDepartmentName(String dept) {
        if (dept == null) return "Computer Science"; // Default or handle null
        String upperDept = dept.toUpperCase().trim();
        switch (upperDept) {
            case "IT": return "Information Technology";
            case "CSE": return "Computer Science";
            case "ECE": return "Electronic & Communication";
            case "MECH": return "Mechanical Engineering";
            case "CIVIL": return "Civil Engineering";
            default: return dept; // Return as is if already full name or unrecognized
        }
    }

    public List<User> getStaffByDepartment(String department) {
        String resolvedDept = resolveDepartmentName(department);
        System.out.println("Fetching staff for dept: " + department + " -> Resolved to: " + resolvedDept);
        return userRepository.findByRoleAndDepartment(Role.STAFF, resolvedDept);
    }

    public void softDeleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    public void updateUserStatus(String id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        user.setStatus(status);
        userRepository.save(user);
    }
}
