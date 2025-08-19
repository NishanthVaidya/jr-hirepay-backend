package com.justresults.hirepay.business.services;

import com.justresults.hirepay.dto.UmbrellaAgreementDTOs.*;

import java.io.IOException;
import java.util.List;

public interface UmbrellaAgreementService {

    /**
     * Send umbrella agreement to a front office user
     */
    UmbrellaAgreementResponse sendAgreement(String sentBy, SendUmbrellaAgreementRequest request) throws IOException;

    /**
     * Sign the umbrella agreement (front office user)
     */
    UmbrellaAgreementResponse signAgreement(String signerEmail, SignAgreementRequest request, org.springframework.web.multipart.MultipartFile signedDocument) throws IOException;

    /**
     * Review the signed agreement (back office user)
     */
    UmbrellaAgreementResponse reviewAgreement(String reviewerEmail, ReviewAgreementRequest request);

    /**
     * Save agreement to Google Drive (back office user)
     */
    UmbrellaAgreementResponse saveToGoogleDrive(String saverEmail, SaveToGoogleDriveRequest request);

    /**
     * Download document
     */
    DocumentDownloadResponse downloadDocument(String documentId) throws IOException;

    /**
     * Get all umbrella agreements for a user
     */
    List<UmbrellaAgreementResponse> getUserAgreements(String userEmail);

    /**
     * Get umbrella agreement by ID
     */
    UmbrellaAgreementResponse getAgreement(String documentId);

    /**
     * Get pending agreements for back office review
     */
    List<UmbrellaAgreementResponse> getPendingReviewAgreements();
}
