package com.justresults.hirepay.business.services;

import com.justresults.hirepay.domain.ProcedureDocument;
import com.justresults.hirepay.dto.DocumentWorkflowDTOs.DocumentWorkflowResponse;
import com.justresults.hirepay.dto.DocumentWorkflowDTOs.SendDocumentRequest;
import com.justresults.hirepay.dto.DocumentWorkflowDTOs.ReceiveDocumentRequest;
import com.justresults.hirepay.dto.DocumentWorkflowDTOs.UpdateDocumentStatusRequest;
import com.justresults.hirepay.enumeration.DocReference;
import com.justresults.hirepay.enumeration.DocumentStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface DocumentWorkflowService {

    /**
     * Send a document to a consultant/client
     */
    DocumentWorkflowResponse sendDocument(String procedureUuid, SendDocumentRequest request) throws IOException;

    /**
     * Receive a document from a consultant/client
     */
    DocumentWorkflowResponse receiveDocument(String procedureUuid, ReceiveDocumentRequest request, MultipartFile file) throws IOException;

    /**
     * Update document status (approve, reject, etc.)
     */
    DocumentWorkflowResponse updateDocumentStatus(String documentId, UpdateDocumentStatusRequest request);

    /**
     * Get all documents for a procedure
     */
    List<DocumentWorkflowResponse> getProcedureDocuments(String procedureUuid);

    /**
     * Get documents by type for a procedure
     */
    List<DocumentWorkflowResponse> getProcedureDocumentsByType(String procedureUuid, DocReference documentType);

    /**
     * Get latest document by type for a procedure
     */
    DocumentWorkflowResponse getLatestDocumentByType(String procedureUuid, DocReference documentType);

    /**
     * Validate document upload (file type, size, etc.)
     */
    void validateDocumentUpload(MultipartFile file, DocReference documentType);

    /**
     * Generate document download URL
     */
    String generateDownloadUrl(String documentId, int expiryMinutes);
}
