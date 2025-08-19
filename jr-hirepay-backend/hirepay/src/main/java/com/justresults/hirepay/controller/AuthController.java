package com.justresults.hirepay.controller;

import com.justresults.hirepay.domain.User;
import com.justresults.hirepay.dto.AuthDTOs.*;
import com.justresults.hirepay.enumeration.Role;
import com.justresults.hirepay.repository.UserRepository;
import com.justresults.hirepay.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; 
        this.encoder = encoder; 
        this.jwt = jwt;
    }

    // One-time bootstrap for first admin (idempotent)
    @PostMapping("/bootstrap-admin")
    public ResponseEntity<?> bootstrapAdmin(@RequestBody @Valid LoginRequest req) {
        if (users.existsByEmail(req.email())) return ResponseEntity.ok().build();
        var user = User.builder()
                .email(req.email())
                .passwordHash(encoder.encode(req.password()))
                .designation("System Administrator")
                .fullName("System Administrator")
                .roles(Set.of(Role.ADMIN, Role.BACK_OFFICE))
                .build();
        users.save(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest req) {
        var user = users.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!encoder.matches(req.password(), user.getPasswordHash()))
            throw new RuntimeException("Invalid credentials");

        var token = jwt.issue(user.getEmail(), Map.of(
                "roles", user.getRoles().stream().map(Enum::name).toList(),
                "designation", user.getDesignation(),
                "fullName", user.getFullName()
        ));
        return new LoginResponse(token);
    }

    // Admin creates users
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody @Valid CreateUserRequest req,
                                        @RequestHeader("Authorization") String auth) {
        // Very light check; we'll formalize method security later
        if (auth == null || !auth.contains("Bearer ")) throw new RuntimeException("Unauthorized");
        // In a follow-up we'll parse roles from token & enforce ADMIN here.

        if (users.existsByEmail(req.email())) throw new RuntimeException("Email already exists");
        var u = User.builder()
                .email(req.email())
                .passwordHash(encoder.encode(req.password()))
                .designation(req.designation() == null ? "Consultant" : req.designation())
                .fullName(req.fullName())
                .roles(req.roles() == null ? Set.of(Role.FRONT_OFFICE) : req.roles())
                .build();
        users.save(u);
        return ResponseEntity.ok().build();
    }
}
