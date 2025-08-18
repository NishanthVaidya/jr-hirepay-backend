package com.justresults.hirepay.dto;

import com.justresults.hirepay.enumeration.DocReference;
import com.justresults.hirepay.enumeration.DocumentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class DocumentWorkflowDTOs {

    public static class SendDocumentRequest {
        @NotNull
        private DocReference documentType;
        @NotBlank
        private String sentBy;
        private String notes;

        public DocReference getDocumentType() { return documentType; }
        public void setDocumentType(DocReference documentType) { this.documentType = documentType; }
        public String getSentBy() { return sentBy; }
        public void setSentBy(String sentBy) { this.sentBy = sentBy; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class ReceiveDocumentRequest {
        @NotNull
        private DocReference documentType;
        @NotBlank
        private String uploadedBy;
        private String notes;

        public DocReference getDocumentType() { return documentType; }
        public void setDocumentType(DocReference documentType) { this.documentType = documentType; }
        public String getUploadedBy() { return uploadedBy; }
        public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class UpdateDocumentStatusRequest {
        @NotNull
        private DocumentStatus status;
        private String notes;
        @NotBlank
        private String updatedBy;

        public DocumentStatus getStatus() { return status; }
        public void setStatus(DocumentStatus status) { this.status = status; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getUpdatedBy() { return updatedBy; }
        public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    }

    public static class DocumentWorkflowResponse {
        private String documentId;
        private DocReference documentType;
        private DocumentStatus status;
        private String location;
        private String actorEmail;
        private int version;
        private Instant createdAt;
        private String notes;
        private String procedureUuid;

        public DocumentWorkflowResponse(String documentId, DocReference documentType, DocumentStatus status, 
                                      String location, String actorEmail, int version, Instant createdAt, 
                                      String notes, String procedureUuid) {
            this.documentId = documentId;
            this.documentType = documentType;
            this.status = status;
            this.location = location;
            this.actorEmail = actorEmail;
            this.version = version;
            this.createdAt = createdAt;
            this.notes = notes;
            this.procedureUuid = procedureUuid;
        }

        // Getters
        public String getDocumentId() { return documentId; }
        public DocReference getDocumentType() { return documentType; }
        public DocumentStatus getStatus() { return status; }
        public String getLocation() { return location; }
        public String getActorEmail() { return actorEmail; }
        public int getVersion() { return version; }
        public Instant getCreatedAt() { return createdAt; }
        public String getNotes() { return notes; }
        public String getProcedureUuid() { return procedureUuid; }
    }
}
