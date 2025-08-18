package com.justresults.hirepay.controller;

import com.justresults.hirepay.domain.User;
import com.justresults.hirepay.dto.UserManagementDTOs.*;
import com.justresults.hirepay.enumeration.Role;
import com.justresults.hirepay.repository.UserRepository;
import com.justresults.hirepay.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserManagementController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Get all front office users (for back office to see)
    @GetMapping("/front-office")
    public ResponseEntity<List<FrontOfficeUserResponse>> getFrontOfficeUsers() {
        List<User> frontOfficeUsers = userRepository.findByRolesContaining(Role.FRONT_OFFICE);
        
        List<FrontOfficeUserResponse> response = frontOfficeUsers.stream()
            .map(user -> new FrontOfficeUserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getDesignation(),
                user.getCreatedAt().toString()
            ))
            .toList();
        
        return ResponseEntity.ok(response);
    }

    // Create new user (admin only)
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().build();
        }

        User user = User.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .designation(request.getDesignation())
            .roles(request.getRoles())
            .build();

        User savedUser = userRepository.save(user);
        
        UserResponse response = new UserResponse(
            savedUser.getId().toString(),
            savedUser.getEmail(),
            savedUser.getDesignation(),
            savedUser.getRoles().stream().map(Enum::name).toList(),
            savedUser.getCreatedAt().toString()
        );
        
        return ResponseEntity.ok(response);
    }

    // Get user by ID
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String userId) {
        User user = userRepository.findById(Long.valueOf(userId))
            .orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        UserResponse response = new UserResponse(
            user.getId().toString(),
            user.getEmail(),
            user.getDesignation(),
            user.getRoles().stream().map(Enum::name).toList(),
            user.getCreatedAt().toString()
        );
        
        return ResponseEntity.ok(response);
    }
}
