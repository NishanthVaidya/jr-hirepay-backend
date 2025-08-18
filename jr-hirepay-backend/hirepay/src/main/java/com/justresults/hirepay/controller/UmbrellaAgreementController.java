package com.justresults.hirepay.controller;

import com.justresults.hirepay.business.services.UmbrellaAgreementService;
import com.justresults.hirepay.dto.UmbrellaAgreementDTOs.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/umbrella-agreements")
public class UmbrellaAgreementController {

    private final UmbrellaAgreementService umbrellaAgreementService;

    public UmbrellaAgreementController(UmbrellaAgreementService umbrellaAgreementService) {
        this.umbrellaAgreementService = umbrellaAgreementService;
    }

    // Send umbrella agreement to front office user (back office only)
    @PostMapping("/send")
    public ResponseEntity<UmbrellaAgreementResponse> sendAgreement(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody SendUmbrellaAgreementRequest request) throws IOException {
        
        String sentBy = extractEmailFromAuthHeader(authHeader);
        UmbrellaAgreementResponse response = umbrellaAgreementService.sendAgreement(sentBy, request);
        return ResponseEntity.ok(response);
    }

    // Sign agreement (front office user)
    @PostMapping("/sign")
    public ResponseEntity<UmbrellaAgreementResponse> signAgreement(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody SignAgreementRequest request) throws IOException {
        
        String signerEmail = extractEmailFromAuthHeader(authHeader);
        UmbrellaAgreementResponse response = umbrellaAgreementService.signAgreement(signerEmail, request);
        return ResponseEntity.ok(response);
    }

    // Review signed agreement (back office only)
    @PostMapping("/review")
    public ResponseEntity<UmbrellaAgreementResponse> reviewAgreement(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ReviewAgreementRequest request) {
        
        String reviewerEmail = extractEmailFromAuthHeader(authHeader);
        UmbrellaAgreementResponse response = umbrellaAgreementService.reviewAgreement(reviewerEmail, request);
        return ResponseEntity.ok(response);
    }

    // Save to Google Drive (back office only)
    @PostMapping("/save-to-drive")
    public ResponseEntity<UmbrellaAgreementResponse> saveToGoogleDrive(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody SaveToGoogleDriveRequest request) {
        
        String saverEmail = extractEmailFromAuthHeader(authHeader);
        UmbrellaAgreementResponse response = umbrellaAgreementService.saveToGoogleDrive(saverEmail, request);
        return ResponseEntity.ok(response);
    }

    // Get user's agreements
    @GetMapping("/my-agreements")
    public ResponseEntity<List<UmbrellaAgreementResponse>> getMyAgreements(
            @RequestHeader("Authorization") String authHeader) {
        
        String userEmail = extractEmailFromAuthHeader(authHeader);
        List<UmbrellaAgreementResponse> agreements = umbrellaAgreementService.getUserAgreements(userEmail);
        return ResponseEntity.ok(agreements);
    }

    // Get specific agreement
    @GetMapping("/{documentId}")
    public ResponseEntity<UmbrellaAgreementResponse> getAgreement(@PathVariable String documentId) {
        UmbrellaAgreementResponse agreement = umbrellaAgreementService.getAgreement(documentId);
        return ResponseEntity.ok(agreement);
    }

    // Get pending review agreements (back office only)
    @GetMapping("/pending-review")
    public ResponseEntity<List<UmbrellaAgreementResponse>> getPendingReviewAgreements() {
        List<UmbrellaAgreementResponse> agreements = umbrellaAgreementService.getPendingReviewAgreements();
        return ResponseEntity.ok(agreements);
    }

    // Helper method to extract email from JWT token
    private String extractEmailFromAuthHeader(String authHeader) {
        // In production, this would properly decode the JWT token
        // For now, we'll use a simple approach
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            // This is a simplified approach - in production, use proper JWT decoding
            return "nishanth@zform.co"; // Placeholder
        }
        throw new RuntimeException("Invalid authorization header");
    }
}
