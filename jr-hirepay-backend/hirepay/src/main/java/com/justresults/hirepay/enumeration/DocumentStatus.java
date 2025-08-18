package com.justresults.hirepay.enumeration;

/**
 * Status of individual documents in the workflow
 */
public enum DocumentStatus {
    DRAFT,              // Document created but not sent
    SENT,              // Document sent to consultant/client
    PENDING_SIGNATURE, // Waiting for signature/upload
    SIGNED,            // Document signed and returned
    APPROVED,          // Back office approved
    REJECTED,          // Back office rejected
    EXPIRED,           // Document expired
    ARCHIVED           // Document archived
}
