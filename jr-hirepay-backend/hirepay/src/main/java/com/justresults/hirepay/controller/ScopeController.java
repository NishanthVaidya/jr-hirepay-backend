package com.justresults.hirepay.controller;

import com.justresults.hirepay.business.services.ScopeService;
import com.justresults.hirepay.dto.CreateScopeRequest;
import com.justresults.hirepay.dto.UpdateScopeRequest;
import com.justresults.hirepay.dto.ReviewScopeRequest;
import com.justresults.hirepay.dto.ScopeResponse;
import com.justresults.hirepay.dto.ScopeDashboardResponse;
import com.justresults.hirepay.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scopes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ScopeController {

    private final ScopeService scopeService;
    private final JwtService jwtService;

    // Back Office: Create new scope assignment
    @PostMapping
    public ResponseEntity<ScopeResponse> createScope(
            @RequestBody CreateScopeRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        Long assignedById = getUserIdFromToken(authHeader);
        ScopeResponse response = scopeService.createScope(request, assignedById);
        return ResponseEntity.ok(response);
    }

    // Get scope by ID
    @GetMapping("/{scopeId}")
    public ResponseEntity<ScopeResponse> getScopeById(@PathVariable Long scopeId) {
        ScopeResponse response = scopeService.getScopeById(scopeId);
        return ResponseEntity.ok(response);
    }

    // Update scope details
    @PutMapping("/{scopeId}")
    public ResponseEntity<ScopeResponse> updateScope(
            @PathVariable Long scopeId,
            @RequestBody UpdateScopeRequest request) {
        
        ScopeResponse response = scopeService.updateScope(scopeId, request);
        return ResponseEntity.ok(response);
    }

    // Review scope (approve/reject) - Back Office only
    @PostMapping("/{scopeId}/review")
    public ResponseEntity<ScopeResponse> reviewScope(
            @PathVariable Long scopeId,
            @RequestBody ReviewScopeRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        Long reviewerId = getUserIdFromToken(authHeader);
        ScopeResponse response = scopeService.reviewScope(scopeId, request, reviewerId);
        return ResponseEntity.ok(response);
    }

    

    // Back Office: Get dashboard data
    @GetMapping("/dashboard")
    public ResponseEntity<ScopeDashboardResponse> getBackOfficeDashboard(
            @RequestHeader("Authorization") String authHeader) {
        
        Long backOfficeUserId = getUserIdFromToken(authHeader);
        ScopeDashboardResponse response = scopeService.getBackOfficeDashboard(backOfficeUserId);
        return ResponseEntity.ok(response);
    }

    // Front Office: Get my scopes
    @GetMapping("/my-scopes")
    public ResponseEntity<List<ScopeResponse>> getMyScopes(
            @RequestHeader("Authorization") String authHeader) {
        
        Long userId = getUserIdFromToken(authHeader);
        List<ScopeResponse> response = scopeService.getMyScopes(userId);
        return ResponseEntity.ok(response);
    }

    // Back Office: Get scopes assigned by me
    @GetMapping("/assigned-by-me")
    public ResponseEntity<List<ScopeResponse>> getScopesAssignedByMe(
            @RequestHeader("Authorization") String authHeader) {
        
        Long backOfficeUserId = getUserIdFromToken(authHeader);
        List<ScopeResponse> response = scopeService.getScopesAssignedByMe(backOfficeUserId);
        return ResponseEntity.ok(response);
    }

    // Get scopes that need review
    @GetMapping("/pending-review")
    public ResponseEntity<List<ScopeResponse>> getScopesNeedingReview() {
        List<ScopeResponse> response = scopeService.getScopesNeedingReview();
        return ResponseEntity.ok(response);
    }

    // Front Office: Submit scope for review
    @PostMapping("/{scopeId}/submit")
    public ResponseEntity<ScopeResponse> submitScopeForReview(@PathVariable Long scopeId) {
        ScopeResponse response = scopeService.submitScopeForReview(scopeId);
        return ResponseEntity.ok(response);
    }

    // Front Office: Start working on scope
    @PostMapping("/{scopeId}/start-work")
    public ResponseEntity<ScopeResponse> startWorkOnScope(@PathVariable Long scopeId) {
        ScopeResponse response = scopeService.startWorkOnScope(scopeId);
        return ResponseEntity.ok(response);
    }

    // Helper method to extract user ID from JWT token
    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtService.extractUserId(token);
    }
}

