package com.justresults.hirepay.dto;

import com.justresults.hirepay.enumeration.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.Set;

public class AuthDTOs {
    public record LoginRequest(@Email String email, @NotBlank String password) {}
    public record LoginResponse(String token) {}
    public record CreateUserRequest(@Email String email,
                                    @NotBlank String password,
                                    String designation,
                                    Set<Role> roles) {}
}
