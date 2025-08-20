package com.justresults.hirepay.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public class UmbrellaAgreementDTOs {

    public static class SendUmbrellaAgreementRequest {
        private String frontOfficeUserId;
        private String notes;
        private MultipartFile document;
        private String documentType;

        public SendUmbrellaAgreementRequest(String frontOfficeUserId, String notes, MultipartFile document, String documentType) {
            this.frontOfficeUserId = frontOfficeUserId;
            this.notes = notes;
            this.document = document;
            this.documentType = documentType;
        }

        public String getFrontOfficeUserId() { return frontOfficeUserId; }
        public void setFrontOfficeUserId(String frontOfficeUserId) { this.frontOfficeUserId = frontOfficeUserId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public MultipartFile getDocument() { return document; }
        public void setDocument(MultipartFile document) { this.document = document; }
        public String getDocumentType() { return documentType; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }
    }

    public static class SubmitWorkRequest {
        private String notes;
        private MultipartFile document;
        private String documentType;

        public SubmitWorkRequest(String notes, MultipartFile document, String documentType) {
            this.notes = notes;
            this.document = document;
            this.documentType = documentType;
        }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public MultipartFile getDocument() { return document; }
        public void setDocument(MultipartFile document) { this.document = document; }
        public String getDocumentType() { return documentType; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }
    }

    public static class SignAgreementRequest {
        @NotBlank
        private String documentId;
        @NotBlank
        private String signerName;
        @NotNull
        private Boolean hasReviewed;
        private String notes;

        public String getDocumentId() { return documentId; }
        public void setDocumentId(String documentId) { this.documentId = documentId; }
        public String getSignerName() { return signerName; }
        public void setSignerName(String signerName) { this.signerName = signerName; }
        public Boolean getHasReviewed() { return hasReviewed; }
        public void setHasReviewed(Boolean hasReviewed) { this.hasReviewed = hasReviewed; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class ReviewAgreementRequest {
        @NotBlank
        private String documentId;
        @NotNull
        private Boolean approved;
        private String notes;

        public String getDocumentId() { return documentId; }
        public void setDocumentId(String documentId) { this.documentId = documentId; }
        public Boolean getApproved() { return approved; }
        public void setApproved(Boolean approved) { this.approved = approved; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class SaveToGoogleDriveRequest {
        @NotBlank
        private String documentId;
        @NotBlank
        private String folderName;

        public String getDocumentId() { return documentId; }
        public void setDocumentId(String documentId) { this.documentId = documentId; }
        public String getFolderName() { return folderName; }
        public void setFolderName(String folderName) { this.folderName = folderName; }
    }

    public static class DocumentDownloadResponse {
        private final Resource resource;
        private final String filename;
        private final String contentType;

        public DocumentDownloadResponse(Resource resource, String filename, String contentType) {
            this.resource = resource;
            this.filename = filename;
            this.contentType = contentType;
        }

        public Resource resource() { return resource; }
        public String filename() { return filename; }
        public String contentType() { return contentType; }
    }

    public static class UmbrellaAgreementResponse {
        private String documentId;
        private String status;
        private String frontOfficeUserEmail;
        private String frontOfficeUserName;
        private String sentBy;
        private String sentAt;
        private String signedAt;
        private String signerName;
        private String reviewedBy;
        private String reviewedAt;
        private String googleDriveUrl;
        private String documentUrl;
        private String documentName;
        private String documentType;
        private String notes;

        public UmbrellaAgreementResponse(String documentId, String status, String frontOfficeUserEmail, 
                                       String frontOfficeUserName, String sentBy, String sentAt, 
                                       String signedAt, String signerName, String reviewedBy, 
                                       String reviewedAt, String googleDriveUrl, String documentUrl, 
                                       String documentName, String documentType, String notes) {
            this.documentId = documentId;
            this.status = status;
            this.frontOfficeUserEmail = frontOfficeUserEmail;
            this.frontOfficeUserName = frontOfficeUserName;
            this.sentBy = sentBy;
            this.sentAt = sentAt;
            this.signedAt = signedAt;
            this.signerName = signerName;
            this.reviewedBy = reviewedBy;
            this.reviewedAt = reviewedAt;
            this.googleDriveUrl = googleDriveUrl;
            this.documentUrl = documentUrl;
            this.documentName = documentName;
            this.documentType = documentType;
            this.notes = notes;
        }

        // Getters
        public String getDocumentId() { return documentId; }
        public String getStatus() { return status; }
        public String getFrontOfficeUserEmail() { return frontOfficeUserEmail; }
        public String getFrontOfficeUserName() { return frontOfficeUserName; }
        public String getSentBy() { return sentBy; }
        public String getSentAt() { return sentAt; }
        public String getSignedAt() { return signedAt; }
        public String getSignerName() { return signerName; }
        public String getReviewedBy() { return reviewedBy; }
        public String getReviewedAt() { return reviewedAt; }
        public String getGoogleDriveUrl() { return googleDriveUrl; }
        public String getDocumentUrl() { return documentUrl; }
        public String getDocumentName() { return documentName; }
        public String getDocumentType() { return documentType; }
        public String getNotes() { return notes; }
    }
}
