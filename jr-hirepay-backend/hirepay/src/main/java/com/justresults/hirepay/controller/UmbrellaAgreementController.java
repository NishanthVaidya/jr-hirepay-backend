package com.justresults.hirepay.controller;

import com.justresults.hirepay.business.services.UmbrellaAgreementService;
import com.justresults.hirepay.dto.UmbrellaAgreementDTOs.*;
import com.justresults.hirepay.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/umbrella-agreements")
public class UmbrellaAgreementController {

    private final UmbrellaAgreementService umbrellaAgreementService;
    private final JwtService jwtService;

    public UmbrellaAgreementController(UmbrellaAgreementService umbrellaAgreementService, JwtService jwtService) {
        this.umbrellaAgreementService = umbrellaAgreementService;
        this.jwtService = jwtService;
    }

    // Send umbrella agreement to front office user with document attachment (back office only)
    @PostMapping(value = "/send", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UmbrellaAgreementResponse> sendAgreement(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("frontOfficeUserId") String frontOfficeUserId,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "document", required = false) MultipartFile document,
            @RequestParam(value = "documentType", required = false) String documentType) throws IOException {
        
        try {
            // Validate required fields
            if (frontOfficeUserId == null || frontOfficeUserId.trim().isEmpty()) {
                throw new IllegalArgumentException("frontOfficeUserId is required");
            }
            
            if (document == null || document.isEmpty()) {
                throw new IllegalArgumentException("document is required");
            }
            
            String sentBy = extractEmailFromAuthHeader(authHeader);
            
            System.out.println("Sending agreement - sentBy: " + sentBy);
            System.out.println("frontOfficeUserId: " + frontOfficeUserId);
            System.out.println("notes: " + notes);
            System.out.println("documentType: " + documentType);
            System.out.println("document: " + (document != null ? document.getOriginalFilename() : "null"));
            
            SendUmbrellaAgreementRequest request = new SendUmbrellaAgreementRequest(
                frontOfficeUserId, 
                notes, 
                document,
                documentType
            );
            
            UmbrellaAgreementResponse response = umbrellaAgreementService.sendAgreement(sentBy, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error sending agreement: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Sign agreement (front office user) - supports optional signed file upload
    @PostMapping(value = "/sign", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UmbrellaAgreementResponse> signAgreement(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("documentId") String documentId,
            @RequestParam("signerName") String signerName,
            @RequestParam("hasReviewed") Boolean hasReviewed,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestPart(value = "signedDocument", required = false) MultipartFile signedDocument) throws IOException {
        try {
            System.out.println("Sign agreement called");
            System.out.println("documentId: " + documentId);
            System.out.println("signerName: " + signerName);
            System.out.println("hasReviewed: " + hasReviewed);
            System.out.println("signedDocument: " + (signedDocument != null ? signedDocument.getOriginalFilename() : "none"));

            String signerEmail = extractEmailFromAuthHeader(authHeader);

            SignAgreementRequest request = new SignAgreementRequest();
            request.setDocumentId(documentId);
            request.setSignerName(signerName);
            request.setHasReviewed(hasReviewed);
            request.setNotes(notes);

            UmbrellaAgreementResponse response = umbrellaAgreementService.signAgreement(signerEmail, request, signedDocument);
            return ResponseEntity.ok(response);
        } catch (com.justresults.hirepay.util.NotFoundException e) {
            System.err.println("Sign error (NotFound): " + e.getMessage());
            return ResponseEntity.status(404).build();
        } catch (com.justresults.hirepay.util.InvalidStateException e) {
            System.err.println("Sign error (InvalidState): " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Unexpected sign error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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

    // Download document
    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable String documentId) throws IOException {
        DocumentDownloadResponse downloadResponse = umbrellaAgreementService.downloadDocument(documentId);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadResponse.filename() + "\"")
            .contentType(MediaType.parseMediaType(downloadResponse.contentType()))
            .body(downloadResponse.resource());
    }

    // Get pending review agreements (back office only)
    @GetMapping("/pending-review")
    public ResponseEntity<List<UmbrellaAgreementResponse>> getPendingReviewAgreements() {
        List<UmbrellaAgreementResponse> agreements = umbrellaAgreementService.getPendingReviewAgreements();
        return ResponseEntity.ok(agreements);
    }

    // Helper method to extract email from JWT token
    private String extractEmailFromAuthHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                var claims = jwtService.parse(token);
                return claims.getSubject();
            } catch (Exception e) {
                throw new RuntimeException("Invalid JWT token: " + e.getMessage());
            }
        }
        throw new RuntimeException("Invalid authorization header");
    }
}
