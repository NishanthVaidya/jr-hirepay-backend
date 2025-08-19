package com.justresults.hirepay.enumeration;

/**
 * Status of individual documents in the workflow
 * Enhanced to support different document types and their specific workflows
 */
public enum DocumentStatus {
    // Universal states
    DRAFT,              // Document created but not sent/submitted
    ARCHIVED,           // Document archived
    
    // Agreement/Contract workflow states
    SENT,              // Document sent to consultant/client (for agreements)
    PENDING_SIGNATURE, // Waiting for signature/upload
    SIGNED,            // Document signed and returned
    APPROVED,          // Back office approved
    REJECTED,          // Back office rejected
    
    // Submission workflow states
    SUBMITTED,         // Front office submitted document for review
    UNDER_REVIEW,      // Back office currently reviewing
    
    // Payment/Invoice specific states
    PAID,              // Payment processed
    OVERDUE,           // Payment past due date
    
    // Completion states
    COMPLETED,         // Deliverables/work completed
    EXPIRED            // Document expired
}
