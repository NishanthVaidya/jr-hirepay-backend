package com.justresults.hirepay.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UmbrellaAgreementDTOs {

    public static class SendUmbrellaAgreementRequest {
        @NotBlank
        private String frontOfficeUserId;
        private String notes;

        public String getFrontOfficeUserId() { return frontOfficeUserId; }
        public void setFrontOfficeUserId(String frontOfficeUserId) { this.frontOfficeUserId = frontOfficeUserId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
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

        public UmbrellaAgreementResponse(String documentId, String status, String frontOfficeUserEmail, 
                                       String frontOfficeUserName, String sentBy, String sentAt, 
                                       String signedAt, String signerName, String reviewedBy, 
                                       String reviewedAt, String googleDriveUrl) {
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
    }
}
