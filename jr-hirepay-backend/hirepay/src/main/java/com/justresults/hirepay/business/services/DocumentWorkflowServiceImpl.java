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
}
