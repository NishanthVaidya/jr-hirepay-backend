package com.justresults.hirepay.business.services;
import com.justresults.hirepay.domain.Procedure;
import com.justresults.hirepay.domain.ProcedureDocument;
import com.justresults.hirepay.domain.User;
import com.justresults.hirepay.dto.UmbrellaAgreementDTOs.*;
import com.justresults.hirepay.enumeration.DocReference;
import com.justresults.hirepay.enumeration.DocumentStatus;
import com.justresults.hirepay.repository.ProcedureDocumentRepository;
import com.justresults.hirepay.repository.ProcedureRepository;
import com.justresults.hirepay.repository.UserRepository;
import com.justresults.hirepay.util.DocumentStorageService;
import com.justresults.hirepay.util.InvalidStateException;
import com.justresults.hirepay.util.NotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.Set;

@Service
@Transactional
public class UmbrellaAgreementServiceImpl implements UmbrellaAgreementService {

    private final DocumentStorageService documentStorageService;
    private final ProcedureRepository procedureRepository;
    private final ProcedureDocumentRepository documentRepository;
    private final UserRepository userRepository;

    public UmbrellaAgreementServiceImpl(DocumentStorageService documentStorageService,
                                       ProcedureRepository procedureRepository,
                                       ProcedureDocumentRepository documentRepository,
                                       UserRepository userRepository) {
        this.documentStorageService = documentStorageService;
        this.procedureRepository = procedureRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public UmbrellaAgreementResponse sendAgreement(String sentBy, SendUmbrellaAgreementRequest request) throws IOException {
        // Get the front office user
        User frontOfficeUser = userRepository.findById(Long.valueOf(request.getFrontOfficeUserId()))
            .orElseThrow(() -> new NotFoundException("Front office user not found"));

        // Create a new procedure for this agreement
        Procedure procedure = new Procedure();
        procedure.setProduct(com.justresults.hirepay.enumeration.ProductType.HIRING);
        procedure.setConsultantEmail(frontOfficeUser.getEmail());
        procedure.setConsultantName(frontOfficeUser.getDesignation());
        procedure.setStatus(com.justresults.hirepay.enumeration.ProcedureStatus.DRAFT);
        procedure = procedureRepository.save(procedure);

        // Handle document upload
        byte[] agreementContent;
        String filename;
        
        if (request.getDocument() != null && !request.getDocument().isEmpty()) {
            // Use uploaded document
            agreementContent = request.getDocument().getBytes();
            filename = request.getDocument().getOriginalFilename();
        } else {
            // Generate default umbrella agreement content
            agreementContent = generateUmbrellaAgreementContent(frontOfficeUser);
            filename = "umbrella-agreement.pdf";
        }

        // Store the document
        String location = documentStorageService.store(procedure.getUuid(), agreementContent, filename);

        // Determine document reference based on document type
        DocReference docReference = determineDocReference(request.getDocumentType());

        // Create document record
        ProcedureDocument document = new ProcedureDocument();
        document.setProcedure(procedure);
        document.setDocReference(docReference);
        document.setLocation(location);
        document.setActorEmail(sentBy);
        document.setStatus(DocumentStatus.SENT);
        document.setNotes(request.getNotes());
        document.setVersion(1);

        ProcedureDocument savedDocument = documentRepository.save(document);

        // Update procedure status
        procedure.setStatus(com.justresults.hirepay.enumeration.ProcedureStatus.AGREEMENT_SENT);
        procedureRepository.save(procedure);

        return createUmbrellaAgreementResponse(savedDocument, frontOfficeUser, sentBy, filename);
    }

    @Override
    public UmbrellaAgreementResponse signAgreement(String signerEmail, SignAgreementRequest request, MultipartFile signedDocument) throws IOException {
        // Get the document
        ProcedureDocument document = documentRepository.findById(Long.valueOf(request.getDocumentId()))
            .orElseThrow(() -> new NotFoundException("Document not found"));

        // Validate the signer
        if (!document.getProcedure().getConsultantEmail().equals(signerEmail)) {
            throw new InvalidStateException("Only the intended recipient can sign this agreement");
        }

        // Validate document status
        if (document.getStatus() != DocumentStatus.SENT) {
            throw new InvalidStateException("Document must be in SENT status to be signed");
        }

        // Create signed version content or use uploaded document
        byte[] signedContent;
        String finalFileName;
        if (signedDocument != null && !signedDocument.isEmpty()) {
            signedContent = signedDocument.getBytes();
            finalFileName = signedDocument.getOriginalFilename();
        } else {
            signedContent = generateSignedAgreementContent(document, request.getSignerName(), request.getHasReviewed());
            finalFileName = "signed-" + extractDocumentName(document.getLocation());
        }

        // Store signed document
        String signedLocation = documentStorageService.store(document.getProcedure().getUuid(), signedContent, finalFileName);

        // Update the original document status based on document type
        // Persist the new file location so subsequent downloads return the submitted version
        document.setLocation(signedLocation);
        
        // Determine if this is a form document
        boolean isFormDocument = isFormDocumentType(document.getDocReference());
        
        // Set appropriate status based on document type
        if (isFormDocument) {
            document.setStatus(DocumentStatus.SUBMITTED);
        } else {
            document.setStatus(DocumentStatus.SIGNED);
        }
        
        String existingNotes = document.getNotes();
        StringBuilder notesBuilder = new StringBuilder();
        if (existingNotes != null && !existingNotes.isBlank()) {
            notesBuilder.append(existingNotes.trim()).append(" | ");
        }
        
        if (isFormDocument) {
            notesBuilder.append("Submitted by: ").append(request.getSignerName())
                .append(" | Completed: ").append(request.getHasReviewed());
            if (request.getNotes() != null && !request.getNotes().isBlank()) {
                notesBuilder.append(" | Form notes: ").append(request.getNotes());
            }
        } else {
            notesBuilder.append("Signed by: ").append(request.getSignerName())
                .append(" | Reviewed: ").append(request.getHasReviewed());
            if (request.getNotes() != null && !request.getNotes().isBlank()) {
                notesBuilder.append(" | Signer notes: ").append(request.getNotes());
            }
        }
        
        document.setNotes(notesBuilder.toString());
        
        ProcedureDocument savedSignedDocument = documentRepository.save(document);

        // Update procedure status
        document.getProcedure().setStatus(com.justresults.hirepay.enumeration.ProcedureStatus.AGREEMENT_SIGNED);
        procedureRepository.save(document.getProcedure());

        // Get front office user
        User frontOfficeUser = userRepository.findByEmail(signerEmail)
            .orElseThrow(() -> new NotFoundException("Front office user not found"));

        return createUmbrellaAgreementResponse(savedSignedDocument, frontOfficeUser, document.getActorEmail(), "signed-umbrella-agreement.pdf");
    }

    @Override
    public UmbrellaAgreementResponse reviewAgreement(String reviewerEmail, ReviewAgreementRequest request) {
        // Get the document
        ProcedureDocument document = documentRepository.findById(Long.valueOf(request.getDocumentId()))
            .orElseThrow(() -> new NotFoundException("Document not found"));

        // Validate document status - allow both SIGNED and SUBMITTED documents to be reviewed
        if (document.getStatus() != DocumentStatus.SIGNED && document.getStatus() != DocumentStatus.SUBMITTED) {
            throw new InvalidStateException("Document must be in SIGNED or SUBMITTED status to be reviewed");
        }

        // Update document status
        document.setStatus(request.getApproved() ? DocumentStatus.APPROVED : DocumentStatus.REJECTED);
        document.setNotes(document.getNotes() + " | Reviewed by: " + reviewerEmail + 
                        (request.getNotes() != null ? " | Review notes: " + request.getNotes() : ""));

        ProcedureDocument savedDocument = documentRepository.save(document);

        // Get front office user
        User frontOfficeUser = userRepository.findByEmail(document.getProcedure().getConsultantEmail())
            .orElseThrow(() -> new NotFoundException("Front office user not found"));

        return createUmbrellaAgreementResponse(savedDocument, frontOfficeUser, document.getActorEmail(), extractDocumentName(document.getLocation()));
    }

    @Override
    public UmbrellaAgreementResponse saveToGoogleDrive(String saverEmail, SaveToGoogleDriveRequest request) {
        // Get the document
        ProcedureDocument document = documentRepository.findById(Long.valueOf(request.getDocumentId()))
            .orElseThrow(() -> new NotFoundException("Document not found"));

        // Validate document status
        if (document.getStatus() != DocumentStatus.APPROVED) {
            throw new InvalidStateException("Document must be in APPROVED status to save to Google Drive");
        }

        // Simulate Google Drive save (in production, this would integrate with Google Drive API)
        String googleDriveUrl = "https://drive.google.com/folders/" + UUID.randomUUID().toString();

        // Update document with Google Drive URL
        document.setNotes(document.getNotes() + " | Saved to Google Drive by: " + saverEmail + 
                        " | Folder: " + request.getFolderName() + " | URL: " + googleDriveUrl);

        ProcedureDocument savedDocument = documentRepository.save(document);

        // Get front office user
        User frontOfficeUser = userRepository.findByEmail(document.getProcedure().getConsultantEmail())
            .orElseThrow(() -> new NotFoundException("Front office user not found"));

        return createUmbrellaAgreementResponse(savedDocument, frontOfficeUser, document.getActorEmail(), extractDocumentName(document.getLocation()));
    }

    @Override
    public DocumentDownloadResponse downloadDocument(String documentId) throws IOException {
        // Get the document
        ProcedureDocument document = documentRepository.findById(Long.valueOf(documentId))
            .orElseThrow(() -> new NotFoundException("Document not found"));

        // Load the document from storage
        Resource resource = documentStorageService.loadAsResource(document.getLocation());
        
        // Determine content type based on file extension
        String contentType = determineContentType(document.getLocation());
        
        // Extract filename from location
        String filename = extractDocumentName(document.getLocation());

        return new DocumentDownloadResponse(resource, filename, contentType);
    }

    @Override
    public List<UmbrellaAgreementResponse> getUserAgreements(String userEmail) {
        // Get all documents where the user is the consultant (recipient) or the actor (sender)
        List<ProcedureDocument> documents = documentRepository.findByActorEmailOrderByCreatedAtDesc(userEmail);
        
        // Also get documents where the user is the consultant (recipient)
        List<ProcedureDocument> receivedDocuments = documentRepository.findByProcedureConsultantEmailOrderByCreatedAtDesc(userEmail);
        
        // Combine both lists and remove duplicates
        Set<Long> seenIds = new HashSet<>();
        List<ProcedureDocument> allDocuments = new ArrayList<>();
        
        for (ProcedureDocument doc : documents) {
            if (!seenIds.contains(doc.getId())) {
                allDocuments.add(doc);
                seenIds.add(doc.getId());
            }
        }
        
        for (ProcedureDocument doc : receivedDocuments) {
            if (!seenIds.contains(doc.getId())) {
                allDocuments.add(doc);
                seenIds.add(doc.getId());
            }
        }
        
        // Sort by creation date descending
        allDocuments.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        return allDocuments.stream()
            .map(this::createUmbrellaAgreementResponseFromDocument)
            .collect(Collectors.toList());
    }

    @Override
    public UmbrellaAgreementResponse getAgreement(String documentId) {
        ProcedureDocument document = documentRepository.findById(Long.valueOf(documentId))
            .orElseThrow(() -> new NotFoundException("Document not found"));

        return createUmbrellaAgreementResponseFromDocument(document);
    }

    @Override
    public List<UmbrellaAgreementResponse> getPendingReviewAgreements() {
        List<ProcedureDocument> documents = documentRepository.findByStatusOrderByCreatedAtDesc(DocumentStatus.SIGNED);

        return documents.stream()
            .map(this::createUmbrellaAgreementResponseFromDocument)
            .collect(Collectors.toList());
    }

    // Helper methods
    private byte[] generateUmbrellaAgreementContent(User frontOfficeUser) throws IOException {
        // In production, this would generate a proper PDF from a template
        String content = "UMBRELLA AGREEMENT\n\n" +
                        "This agreement is between Just Results and " + frontOfficeUser.getDesignation() + " (" + frontOfficeUser.getEmail() + ")\n\n" +
                        "Generated on: " + Instant.now() + "\n\n" +
                        "Please review and sign this agreement.";
        return content.getBytes();
    }

    private byte[] generateSignedAgreementContent(ProcedureDocument originalDocument, String signerName, Boolean hasReviewed) throws IOException {
        // In production, this would add signature to the original PDF
        String content = "SIGNED UMBRELLA AGREEMENT\n\n" +
                        "Original agreement signed by: " + signerName + "\n" +
                        "Has reviewed agreement: " + hasReviewed + "\n" +
                        "Signed on: " + Instant.now() + "\n\n" +
                        "This document is now legally binding.";
        return content.getBytes();
    }

    private String determineContentType(String location) {
        if (location.toLowerCase().endsWith(".pdf")) {
            return "application/pdf";
        } else if (location.toLowerCase().endsWith(".doc")) {
            return "application/msword";
        } else if (location.toLowerCase().endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else {
            return "application/octet-stream";
        }
    }

    private String extractDocumentName(String location) {
        if (location != null && location.contains("/")) {
            return location.substring(location.lastIndexOf("/") + 1);
        }
        return "document";
    }

    private UmbrellaAgreementResponse createUmbrellaAgreementResponse(ProcedureDocument document, User frontOfficeUser, String sentBy, String documentName) {
        return new UmbrellaAgreementResponse(
            document.getId().toString(),
            document.getStatus().name(),
            frontOfficeUser.getEmail(),
            frontOfficeUser.getDesignation(),
            sentBy,
            document.getCreatedAt().toString(),
            document.getStatus() == DocumentStatus.SIGNED ? document.getCreatedAt().toString() : null,
            document.getStatus() == DocumentStatus.SIGNED ? extractSignerName(document.getNotes()) : null,
            document.getStatus() == DocumentStatus.APPROVED ? document.getActorEmail() : null,
            document.getStatus() == DocumentStatus.APPROVED ? document.getCreatedAt().toString() : null,
            extractGoogleDriveUrl(document.getNotes()),
            document.getLocation(),
            documentName,
            document.getDocReference().name(),
            document.getNotes()
        );
    }

    private UmbrellaAgreementResponse createUmbrellaAgreementResponseFromDocument(ProcedureDocument document) {
        User frontOfficeUser = userRepository.findByEmail(document.getProcedure().getConsultantEmail())
            .orElseThrow(() -> new NotFoundException("Front office user not found"));

        return createUmbrellaAgreementResponse(document, frontOfficeUser, document.getActorEmail(), extractDocumentName(document.getLocation()));
    }

    private String extractSignerName(String notes) {
        if (notes != null && notes.contains("Signed by:")) {
            return notes.split("Signed by:")[1].split("\\|")[0].trim();
        }
        return null;
    }

    private String extractGoogleDriveUrl(String notes) {
        if (notes != null && notes.contains("URL:")) {
            return notes.split("URL:")[1].trim();
        }
        return null;
    }

    private DocReference determineDocReference(String documentType) {
        if (documentType == null) {
            return DocReference.UMBRELLA_AGREEMENT; // Default
        }
        
        try {
            return DocReference.valueOf(documentType);
        } catch (IllegalArgumentException e) {
            // If the document type is not a valid enum value, default to UMBRELLA_AGREEMENT
            return DocReference.UMBRELLA_AGREEMENT;
        }
    }
    
    /**
     * Check if a document type is a form submission
     */
    private boolean isFormDocumentType(DocReference docReference) {
        return docReference == DocReference.TAX_FORM_W9 ||
               docReference == DocReference.TAX_FORM_W8BEN ||
               docReference == DocReference.PAYMENT_AUTH_FORM;
    }
}
