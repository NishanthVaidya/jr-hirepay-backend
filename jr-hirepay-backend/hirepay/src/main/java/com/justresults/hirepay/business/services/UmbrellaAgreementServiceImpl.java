package com.justresults.hirepay.business.services;

import com.justresults.hirepay.business.services.DocumentWorkflowService;
import com.justresults.hirepay.domain.Procedure;
import com.justresults.hirepay.domain.ProcedureDocument;
import com.justresults.hirepay.domain.User;
import com.justresults.hirepay.dto.DocumentWorkflowDTOs.SendDocumentRequest;
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
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UmbrellaAgreementServiceImpl implements UmbrellaAgreementService {

    private final DocumentWorkflowService documentWorkflowService;
    private final DocumentStorageService documentStorageService;
    private final ProcedureRepository procedureRepository;
    private final ProcedureDocumentRepository documentRepository;
    private final UserRepository userRepository;

    public UmbrellaAgreementServiceImpl(DocumentWorkflowService documentWorkflowService,
                                       DocumentStorageService documentStorageService,
                                       ProcedureRepository procedureRepository,
                                       ProcedureDocumentRepository documentRepository,
                                       UserRepository userRepository) {
        this.documentWorkflowService = documentWorkflowService;
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

        // Generate umbrella agreement content
        byte[] agreementContent = generateUmbrellaAgreementContent(frontOfficeUser);

        // Store the document
        String location = documentStorageService.store(procedure.getUuid(), agreementContent, "umbrella-agreement.pdf");

        // Create document record
        ProcedureDocument document = new ProcedureDocument();
        document.setProcedure(procedure);
        document.setDocReference(DocReference.UMBRELLA_AGREEMENT);
        document.setLocation(location);
        document.setActorEmail(sentBy);
        document.setStatus(DocumentStatus.SENT);
        document.setNotes(request.getNotes());
        document.setVersion(1);

        ProcedureDocument savedDocument = documentRepository.save(document);

        // Update procedure status
        procedure.setStatus(com.justresults.hirepay.enumeration.ProcedureStatus.AGREEMENT_SENT);
        procedureRepository.save(procedure);

        return createUmbrellaAgreementResponse(savedDocument, frontOfficeUser, sentBy);
    }

    @Override
    public UmbrellaAgreementResponse signAgreement(String signerEmail, SignAgreementRequest request) throws IOException {
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

        // Create signed version
        byte[] signedContent = generateSignedAgreementContent(document, request.getSignerName(), request.getHasReviewed());

        // Store signed document
        String signedLocation = documentStorageService.store(document.getProcedure().getUuid(), signedContent, "signed-umbrella-agreement.pdf");

        // Create new document version
        ProcedureDocument signedDocument = new ProcedureDocument();
        signedDocument.setProcedure(document.getProcedure());
        signedDocument.setDocReference(DocReference.UMBRELLA_AGREEMENT);
        signedDocument.setLocation(signedLocation);
        signedDocument.setActorEmail(signerEmail);
        signedDocument.setStatus(DocumentStatus.SIGNED);
        signedDocument.setNotes("Signed by: " + request.getSignerName() + " | Reviewed: " + request.getHasReviewed() + 
                               (request.getNotes() != null ? " | Notes: " + request.getNotes() : ""));
        signedDocument.setVersion(document.getVersion() + 1);

        ProcedureDocument savedSignedDocument = documentRepository.save(signedDocument);

        // Update procedure status
        document.getProcedure().setStatus(com.justresults.hirepay.enumeration.ProcedureStatus.AGREEMENT_SIGNED);
        procedureRepository.save(document.getProcedure());

        // Get front office user
        User frontOfficeUser = userRepository.findByEmail(signerEmail)
            .orElseThrow(() -> new NotFoundException("Front office user not found"));

        return createUmbrellaAgreementResponse(savedSignedDocument, frontOfficeUser, document.getActorEmail());
    }

    @Override
    public UmbrellaAgreementResponse reviewAgreement(String reviewerEmail, ReviewAgreementRequest request) {
        // Get the document
        ProcedureDocument document = documentRepository.findById(Long.valueOf(request.getDocumentId()))
            .orElseThrow(() -> new NotFoundException("Document not found"));

        // Validate document status
        if (document.getStatus() != DocumentStatus.SIGNED) {
            throw new InvalidStateException("Document must be in SIGNED status to be reviewed");
        }

        // Update document status
        document.setStatus(request.getApproved() ? DocumentStatus.APPROVED : DocumentStatus.REJECTED);
        document.setNotes(document.getNotes() + " | Reviewed by: " + reviewerEmail + 
                        (request.getNotes() != null ? " | Review notes: " + request.getNotes() : ""));

        ProcedureDocument savedDocument = documentRepository.save(document);

        // Get front office user
        User frontOfficeUser = userRepository.findByEmail(document.getProcedure().getConsultantEmail())
            .orElseThrow(() -> new NotFoundException("Front office user not found"));

        return createUmbrellaAgreementResponse(savedDocument, frontOfficeUser, document.getActorEmail());
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

        return createUmbrellaAgreementResponse(savedDocument, frontOfficeUser, document.getActorEmail());
    }

    @Override
    public List<UmbrellaAgreementResponse> getUserAgreements(String userEmail) {
        List<ProcedureDocument> documents = documentRepository.findByActorEmailAndDocReferenceOrderByCreatedAtDesc(
            userEmail, DocReference.UMBRELLA_AGREEMENT);

        return documents.stream()
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
        List<ProcedureDocument> documents = documentRepository.findByDocReferenceAndStatusOrderByCreatedAtDesc(
            DocReference.UMBRELLA_AGREEMENT, DocumentStatus.SIGNED);

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

    private UmbrellaAgreementResponse createUmbrellaAgreementResponse(ProcedureDocument document, User frontOfficeUser, String sentBy) {
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
            extractGoogleDriveUrl(document.getNotes())
        );
    }

    private UmbrellaAgreementResponse createUmbrellaAgreementResponseFromDocument(ProcedureDocument document) {
        User frontOfficeUser = userRepository.findByEmail(document.getProcedure().getConsultantEmail())
            .orElseThrow(() -> new NotFoundException("Front office user not found"));

        return createUmbrellaAgreementResponse(document, frontOfficeUser, document.getActorEmail());
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
}
