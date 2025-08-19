package com.justresults.hirepay.business.services;

import com.justresults.hirepay.business.services.HiringService;
import com.justresults.hirepay.domain.Procedure;
import com.justresults.hirepay.domain.ProcedureDocument;
import com.justresults.hirepay.dto.DocumentWorkflowDTOs.*;
import com.justresults.hirepay.enumeration.DocReference;
import com.justresults.hirepay.enumeration.DocumentStatus;
import com.justresults.hirepay.enumeration.ProcedureStatus;
import com.justresults.hirepay.repository.ProcedureDocumentRepository;
import com.justresults.hirepay.util.DocumentStorageService;
import com.justresults.hirepay.util.InvalidStateException;
import com.justresults.hirepay.util.NotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DocumentWorkflowServiceImpl implements DocumentWorkflowService {

    private final HiringService hiringService;
    private final DocumentStorageService documentStorageService;
    private final ProcedureDocumentRepository documentRepository;

    public DocumentWorkflowServiceImpl(HiringService hiringService, 
                                     DocumentStorageService documentStorageService,
                                     ProcedureDocumentRepository documentRepository) {
        this.hiringService = hiringService;
        this.documentStorageService = documentStorageService;
        this.documentRepository = documentRepository;
    }

    @Override
    public DocumentWorkflowResponse sendDocument(String procedureUuid, SendDocumentRequest request) throws IOException {
        // Validate procedure exists
        Procedure procedure = hiringService.getByUuid(procedureUuid);
        
        // Generate document content (this will be overridden by specific implementations)
        byte[] documentContent = generateDocumentContent(procedure, request.getDocumentType());
        
        // Store document
        String location = documentStorageService.store(procedureUuid, documentContent, 
            request.getDocumentType().name().toLowerCase() + ".pdf");
        
        // Create document record
        ProcedureDocument document = new ProcedureDocument();
        document.setProcedure(procedure);
        document.setDocReference(request.getDocumentType());
        document.setLocation(location);
        document.setActorEmail(request.getSentBy());
        document.setStatus(DocumentStatus.SENT);
        document.setNotes(request.getNotes());
        document.setVersion(1);
        
        ProcedureDocument savedDocument = documentRepository.save(document);
        
        // Update procedure status based on document type
        updateProcedureStatusForDocument(procedure, request.getDocumentType());
        
        return createDocumentWorkflowResponse(savedDocument);
    }

    @Override
    public DocumentWorkflowResponse receiveDocument(String procedureUuid, ReceiveDocumentRequest request, MultipartFile file) throws IOException {
        // Validate procedure exists
        Procedure procedure = hiringService.getByUuid(procedureUuid);
        
        // Validate document upload
        validateDocumentUpload(file, request.getDocumentType());
        
        // Store document
        String location = documentStorageService.store(procedureUuid, file);
        
        // Get next version number
        int nextVersion = getNextVersionNumber(procedure, request.getDocumentType());
        
        // Create document record
        ProcedureDocument document = new ProcedureDocument();
        document.setProcedure(procedure);
        document.setDocReference(request.getDocumentType());
        document.setLocation(location);
        document.setActorEmail(request.getUploadedBy());
        document.setStatus(DocumentStatus.SIGNED);
        document.setNotes(request.getNotes());
        document.setVersion(nextVersion);
        
        ProcedureDocument savedDocument = documentRepository.save(document);
        
        // Update procedure status based on document type
        updateProcedureStatusForDocument(procedure, request.getDocumentType());
        
        return createDocumentWorkflowResponse(savedDocument);
    }

    @Override
    public DocumentWorkflowResponse updateDocumentStatus(String documentId, UpdateDocumentStatusRequest request) {
        ProcedureDocument document = documentRepository.findById(Long.valueOf(documentId))
            .orElseThrow(() -> new NotFoundException("Document not found: " + documentId));
        
        // Validate status transition based on document type
        validateStatusTransition(document.getDocReference(), document.getStatus(), request.getStatus());
        
        document.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            document.setNotes(request.getNotes());
        }
        
        ProcedureDocument savedDocument = documentRepository.save(document);
        return createDocumentWorkflowResponse(savedDocument);
    }

    @Override
    public List<DocumentWorkflowResponse> getProcedureDocuments(String procedureUuid) {
        Procedure procedure = hiringService.getByUuid(procedureUuid);
        List<ProcedureDocument> documents = documentRepository.findByProcedureOrderByCreatedAtDesc(procedure);
        
        return documents.stream()
            .map(this::createDocumentWorkflowResponse)
            .collect(Collectors.toList());
    }

    @Override
    public List<DocumentWorkflowResponse> getProcedureDocumentsByType(String procedureUuid, DocReference documentType) {
        Procedure procedure = hiringService.getByUuid(procedureUuid);
        List<ProcedureDocument> documents = documentRepository.findByProcedureAndDocReferenceOrderByVersionDesc(procedure, documentType);
        
        return documents.stream()
            .map(this::createDocumentWorkflowResponse)
            .collect(Collectors.toList());
    }

    @Override
    public DocumentWorkflowResponse getLatestDocumentByType(String procedureUuid, DocReference documentType) {
        Procedure procedure = hiringService.getByUuid(procedureUuid);
        List<ProcedureDocument> documents = documentRepository.findByProcedureAndDocReferenceOrderByVersionDesc(procedure, documentType);
        
        if (documents.isEmpty()) {
            return null;
        }
        
        return createDocumentWorkflowResponse(documents.get(0));
    }

    @Override
    public void validateDocumentUpload(MultipartFile file, DocReference documentType) {
        if (file.isEmpty()) {
            throw new InvalidStateException("File cannot be empty");
        }
        
        // Check file size (10MB limit)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new InvalidStateException("File size cannot exceed 10MB");
        }
        
        // Check file type (PDF, DOC, DOCX)
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && 
            !contentType.equals("application/msword") && 
            !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new InvalidStateException("Only PDF, DOC, and DOCX files are allowed");
        }
    }

    @Override
    public String generateDownloadUrl(String documentId, int expiryMinutes) {
        // For now, return a simple download endpoint
        // In production, this would generate signed URLs for cloud storage
        return "/api/documents/" + documentId + "/download";
    }

    // Helper methods
    private byte[] generateDocumentContent(Procedure procedure, DocReference documentType) throws IOException {
        // This will be overridden by specific document type implementations
        // For now, return a simple placeholder
        return ("Placeholder document for " + documentType.name() + " - " + procedure.getConsultantName()).getBytes();
    }

    private int getNextVersionNumber(Procedure procedure, DocReference documentType) {
        List<ProcedureDocument> existing = documentRepository.findByProcedureAndDocReferenceOrderByVersionDesc(procedure, documentType);
        return existing.isEmpty() ? 1 : existing.get(0).getVersion() + 1;
    }

    private void updateProcedureStatusForDocument(Procedure procedure, DocReference documentType) {
        switch (documentType) {
            case UMBRELLA_AGREEMENT:
                if (procedure.getStatus() == ProcedureStatus.DRAFT) {
                    procedure.setStatus(ProcedureStatus.AGREEMENT_SENT);
                }
                break;
            case TAX_FORM_W9:
            case TAX_FORM_W8BEN:
            case PAYMENT_AUTH_FORM:
                if (procedure.getStatus() == ProcedureStatus.AGREEMENT_SIGNED) {
                    procedure.setStatus(ProcedureStatus.PAYMENT_TAX_SUBMITTED);
                }
                break;
            case TASK_ORDER:
                if (procedure.getStatus() == ProcedureStatus.PAYMENT_TAX_APPROVED) {
                    procedure.setStatus(ProcedureStatus.TASK_ORDER_GENERATED);
                }
                break;
        }
    }

    private DocumentWorkflowResponse createDocumentWorkflowResponse(ProcedureDocument document) {
        return new DocumentWorkflowResponse(
            document.getId().toString(),
            document.getDocReference(),
            document.getStatus(),
            document.getLocation(),
            document.getActorEmail(),
            document.getVersion(),
            document.getCreatedAt(),
            document.getNotes(),
            document.getProcedure().getUuid()
        );
    }
    
    /**
     * Validate status transitions based on document type
     */
    private void validateStatusTransition(DocReference documentType, DocumentStatus currentStatus, DocumentStatus newStatus) {
        // Define valid transitions for each document type
        switch (documentType) {
            case UMBRELLA_AGREEMENT:
            case AGREEMENT_MODIFICATION:
            case TASK_ORDER:
            case TASK_ORDER_MODIFICATION:
                // Agreement workflow: DRAFT -> SENT -> SIGNED -> APPROVED/REJECTED
                validateAgreementStatusTransition(currentStatus, newStatus);
                break;
                
            case TAX_FORM_W9:
            case TAX_FORM_W8BEN:
            case PAYMENT_AUTH_FORM:
                // Form workflow: DRAFT -> SUBMITTED -> APPROVED/REJECTED
                validateFormStatusTransition(currentStatus, newStatus);
                break;
                
            case INVOICE:
                // Invoice workflow: DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> PAID/OVERDUE
                validateInvoiceStatusTransition(currentStatus, newStatus);
                break;
                
            case DELIVERABLES_PROOF:
                // Deliverable workflow: DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> COMPLETED
                validateDeliverableStatusTransition(currentStatus, newStatus);
                break;
                
            default:
                // Allow any transition for unknown document types
                break;
        }
    }
    
    private void validateAgreementStatusTransition(DocumentStatus currentStatus, DocumentStatus newStatus) {
        // Agreement documents follow: DRAFT -> SENT -> SIGNED -> APPROVED/REJECTED
        if (currentStatus == DocumentStatus.DRAFT && newStatus != DocumentStatus.SENT) {
            throw new InvalidStateException("Draft agreements can only be sent");
        }
        if (currentStatus == DocumentStatus.SENT && newStatus != DocumentStatus.SIGNED) {
            throw new InvalidStateException("Sent agreements can only be signed");
        }
        if (currentStatus == DocumentStatus.SIGNED && newStatus != DocumentStatus.APPROVED && newStatus != DocumentStatus.REJECTED) {
            throw new InvalidStateException("Signed agreements can only be approved or rejected");
        }
    }
    
    private void validateFormStatusTransition(DocumentStatus currentStatus, DocumentStatus newStatus) {
        // Form documents follow: DRAFT -> SUBMITTED -> APPROVED/REJECTED
        if (currentStatus == DocumentStatus.DRAFT && newStatus != DocumentStatus.SUBMITTED) {
            throw new InvalidStateException("Draft forms can only be submitted");
        }
        if (currentStatus == DocumentStatus.SUBMITTED && newStatus != DocumentStatus.APPROVED && newStatus != DocumentStatus.REJECTED) {
            throw new InvalidStateException("Submitted forms can only be approved or rejected");
        }
    }
    
    private void validateInvoiceStatusTransition(DocumentStatus currentStatus, DocumentStatus newStatus) {
        // Invoice documents follow: DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> PAID/OVERDUE
        if (currentStatus == DocumentStatus.DRAFT && newStatus != DocumentStatus.SUBMITTED) {
            throw new InvalidStateException("Draft invoices can only be submitted");
        }
        if (currentStatus == DocumentStatus.SUBMITTED && newStatus != DocumentStatus.UNDER_REVIEW) {
            throw new InvalidStateException("Submitted invoices can only be put under review");
        }
        if (currentStatus == DocumentStatus.UNDER_REVIEW && newStatus != DocumentStatus.APPROVED && newStatus != DocumentStatus.REJECTED) {
            throw new InvalidStateException("Invoices under review can only be approved or rejected");
        }
        if (currentStatus == DocumentStatus.APPROVED && newStatus != DocumentStatus.PAID && newStatus != DocumentStatus.OVERDUE) {
            throw new InvalidStateException("Approved invoices can only be marked as paid or overdue");
        }
    }
    
    private void validateDeliverableStatusTransition(DocumentStatus currentStatus, DocumentStatus newStatus) {
        // Deliverable documents follow: DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> COMPLETED
        if (currentStatus == DocumentStatus.DRAFT && newStatus != DocumentStatus.SUBMITTED) {
            throw new InvalidStateException("Draft deliverables can only be submitted");
        }
        if (currentStatus == DocumentStatus.SUBMITTED && newStatus != DocumentStatus.UNDER_REVIEW) {
            throw new InvalidStateException("Submitted deliverables can only be put under review");
        }
        if (currentStatus == DocumentStatus.UNDER_REVIEW && newStatus != DocumentStatus.APPROVED && newStatus != DocumentStatus.REJECTED) {
            throw new InvalidStateException("Deliverables under review can only be approved or rejected");
        }
        if (currentStatus == DocumentStatus.APPROVED && newStatus != DocumentStatus.COMPLETED) {
            throw new InvalidStateException("Approved deliverables can only be marked as completed");
        }
    }
}
