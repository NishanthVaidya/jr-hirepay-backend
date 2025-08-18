package com.justresults.hirepay.controller;

import com.justresults.hirepay.business.services.DocumentWorkflowService;
import com.justresults.hirepay.dto.DocumentWorkflowDTOs.*;
import com.justresults.hirepay.enumeration.DocReference;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentWorkflowController {

    private final DocumentWorkflowService documentWorkflowService;

    public DocumentWorkflowController(DocumentWorkflowService documentWorkflowService) {
        this.documentWorkflowService = documentWorkflowService;
    }

    // Send document to consultant/client
    @PostMapping("/{procedureUuid}/send")
    public ResponseEntity<DocumentWorkflowResponse> sendDocument(
            @PathVariable String procedureUuid,
            @Valid @RequestBody SendDocumentRequest request) throws IOException {
        
        DocumentWorkflowResponse response = documentWorkflowService.sendDocument(procedureUuid, request);
        return ResponseEntity.ok(response);
    }

    // Receive document from consultant/client
    @PostMapping("/{procedureUuid}/receive")
    public ResponseEntity<DocumentWorkflowResponse> receiveDocument(
            @PathVariable String procedureUuid,
            @Valid @ModelAttribute ReceiveDocumentRequest request,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        DocumentWorkflowResponse response = documentWorkflowService.receiveDocument(procedureUuid, request, file);
        return ResponseEntity.ok(response);
    }

    // Update document status (approve, reject, etc.)
    @PutMapping("/{documentId}/status")
    public ResponseEntity<DocumentWorkflowResponse> updateDocumentStatus(
            @PathVariable String documentId,
            @Valid @RequestBody UpdateDocumentStatusRequest request) {
        
        DocumentWorkflowResponse response = documentWorkflowService.updateDocumentStatus(documentId, request);
        return ResponseEntity.ok(response);
    }

    // Get all documents for a procedure
    @GetMapping("/{procedureUuid}")
    public ResponseEntity<List<DocumentWorkflowResponse>> getProcedureDocuments(
            @PathVariable String procedureUuid) {
        
        List<DocumentWorkflowResponse> documents = documentWorkflowService.getProcedureDocuments(procedureUuid);
        return ResponseEntity.ok(documents);
    }

    // Get documents by type for a procedure
    @GetMapping("/{procedureUuid}/type/{documentType}")
    public ResponseEntity<List<DocumentWorkflowResponse>> getProcedureDocumentsByType(
            @PathVariable String procedureUuid,
            @PathVariable DocReference documentType) {
        
        List<DocumentWorkflowResponse> documents = documentWorkflowService.getProcedureDocumentsByType(procedureUuid, documentType);
        return ResponseEntity.ok(documents);
    }

    // Get latest document by type for a procedure
    @GetMapping("/{procedureUuid}/latest/{documentType}")
    public ResponseEntity<DocumentWorkflowResponse> getLatestDocumentByType(
            @PathVariable String procedureUuid,
            @PathVariable DocReference documentType) {
        
        DocumentWorkflowResponse document = documentWorkflowService.getLatestDocumentByType(procedureUuid, documentType);
        if (document == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(document);
    }

    // Generate download URL for a document
    @GetMapping("/{documentId}/download-url")
    public ResponseEntity<String> generateDownloadUrl(
            @PathVariable String documentId,
            @RequestParam(defaultValue = "60") int expiryMinutes) {
        
        String downloadUrl = documentWorkflowService.generateDownloadUrl(documentId, expiryMinutes);
        return ResponseEntity.ok(downloadUrl);
    }
}
