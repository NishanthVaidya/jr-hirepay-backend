package com.justresults.hirepay.dto;

import com.justresults.hirepay.enumeration.DocReference;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class HiringRequests {

    public static class CreateProcedureRequest {
        @Email @NotBlank
        private String consultantEmail;
        @NotBlank
        private String consultantName;

        public String getConsultantEmail() { return consultantEmail; }
        public void setConsultantEmail(String consultantEmail) { this.consultantEmail = consultantEmail; }
        public String getConsultantName() { return consultantName; }
        public void setConsultantName(String consultantName) { this.consultantName = consultantName; }
    }

    // For now we pass a pre-stored location; in Step 4 we’ll wire real file storage.
    public static class AddDocumentRequest {
        @NotNull
        private DocReference docReference;
        @NotBlank
        private String location;       // e.g., "file:/.../signed.pdf" or "s3://bucket/key"
        @NotBlank
        private String actorEmail;

        public DocReference getDocReference() { return docReference; }
        public void setDocReference(DocReference docReference) { this.docReference = docReference; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getActorEmail() { return actorEmail; }
        public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }
    }

    public static class ApprovePaymentTaxRequest {
        private boolean approved;
        private String notes;

        public boolean isApproved() { return approved; }
        public void setApproved(boolean approved) { this.approved = approved; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class AcceptTaskOrderRequest {
        @NotBlank
        private String acceptedBy; // email of person accepting
        
        private String acceptedFrom; // IP, user agent, etc.

        public String getAcceptedBy() { return acceptedBy; }
        public void setAcceptedBy(String acceptedBy) { this.acceptedBy = acceptedBy; }
        
        public String getAcceptedFrom() { return acceptedFrom; }
        public void setAcceptedFrom(String acceptedFrom) { this.acceptedFrom = acceptedFrom; }
    }
}
