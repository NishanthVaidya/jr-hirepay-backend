package com.justresults.hirepay.controller;

import com.justresults.hirepay.domain.User;
import com.justresults.hirepay.dto.UserManagementDTOs.FrontOfficeUserResponse;
import com.justresults.hirepay.enumeration.Role;
import com.justresults.hirepay.repository.UserRepository;
import com.justresults.hirepay.security.JwtService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserManagementController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "fullName") String sortBy,
            @RequestHeader("Authorization") String auth) {
        
        // Verify admin access
        if (auth == null || !auth.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            String token = auth.substring(7);
            var claims = jwtService.parse(token);
            var roles = claims.get("roles", List.class);
            
            if (roles == null || !roles.contains("ADMIN")) {
                return ResponseEntity.status(403).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, sortBy));
        Page<User> users = userRepository.findAll(pageable);
        
        Page<UserResponse> userResponses = users.map(user -> new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getDesignation(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toList())
        ));
        
        return ResponseEntity.ok(userResponses);
    }

    // Get all front office users (for back office to see)
    @GetMapping("/front-office")
    public ResponseEntity<List<FrontOfficeUserResponse>> getFrontOfficeUsers() {
        List<User> frontOfficeUsers = userRepository.findByRolesContaining(Role.FRONT_OFFICE);
        
        List<FrontOfficeUserResponse> response = frontOfficeUsers.stream()
            .map(user -> new FrontOfficeUserResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFullName(),
                user.getDesignation(),
                user.getCreatedAt().toString()
            ))
            .toList();
        
        return ResponseEntity.ok(response);
    }

    public record UserResponse(
            Long id,
            String email,
            String fullName,
            String designation,
            List<String> roles
    ) {}
}
