package com.crms.dto.request;

import com.crms.model.Role;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    private Role role; // Optional, defaults to STUDENT if null (logic in controller)

    @NotBlank
    @Size(min = 6, max = 40)
    // Strong password: At least 8 chars, 1 digit, 1 lower, 1 upper, 1 special char
    // Note: Kept min=6 in @Size but logic should ideally align. Let's make it
    // strict.
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$", message = "Password must be at least 8 characters and contain at least one digit, one lowercase, one uppercase, and one special character")
    private String password;

    private String department;
}
