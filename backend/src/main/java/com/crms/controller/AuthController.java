package com.crms.controller;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.crms.dto.request.LoginRequest;
import com.crms.dto.request.SignupRequest;
import com.crms.dto.response.JwtResponse;
import com.crms.dto.response.MessageResponse;
import com.crms.model.Role;
import com.crms.model.User;
import com.crms.repository.UserRepository;
import com.crms.security.jwt.JwtUtils;
import com.crms.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    // Check if user exists
    User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);
    if (user == null) {
      return ResponseEntity.status(401).body(new MessageResponse("Error: Account does not exist."));
    }

    // Check if user is active/verified
    if (user.getStatus() != com.crms.model.UserStatus.ACTIVE) {
      return ResponseEntity.status(401).body(new MessageResponse("Error: Account not verified."));
    }

    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);

      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());

      return ResponseEntity.ok(new JwtResponse(jwt,
          userDetails.getId(),
          userDetails.getUsername(),
          userDetails.getEmail(),
          userDetails.getDepartment(),
          roles));
    } catch (org.springframework.security.authentication.BadCredentialsException e) {
      return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid password."));
    }
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity
          .badRequest()
          .body(new MessageResponse("Error: Email is already in use!"));
    }

    // Create new user's account
    User user = new User();
    user.setName(signUpRequest.getName());
    user.setEmail(signUpRequest.getEmail());
    user.setPhone(signUpRequest.getPhone());
    user.setPassword(encoder.encode(signUpRequest.getPassword()));
    user.setDepartment(signUpRequest.getDepartment());

    // Default to STUDENT if no role provided
    Role role = signUpRequest.getRole() != null ? signUpRequest.getRole() : Role.STUDENT;
    user.setRole(role);

    userRepository.save(user);

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }
}
