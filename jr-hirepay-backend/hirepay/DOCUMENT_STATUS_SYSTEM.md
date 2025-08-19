# Enhanced Document Status System

## Overview

The document status system has been enhanced to support different workflows for various document types in the Get Hired and Get Paid application. Each document type now has its own appropriate status progression that matches its business workflow.

## Document Status Enum (Backend)

### Enhanced DocumentStatus Enum
```java
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
```

## Document Types and Their Workflows

### 1. Agreement Documents
**Types:** `UMBRELLA_AGREEMENT`, `AGREEMENT_MODIFICATION`, `TASK_ORDER`, `TASK_ORDER_MODIFICATION`

**Workflow:** `DRAFT` → `SENT` → `SIGNED` → `APPROVED`/`REJECTED`

**Description:** These documents require signature from the consultant/client and approval from back office.

### 2. Form Documents
**Types:** `TAX_FORM_W9`, `TAX_FORM_W8BEN`, `PAYMENT_AUTH_FORM`

**Workflow:** `DRAFT` → `SUBMITTED` → `APPROVED`/`REJECTED`

**Description:** These are forms submitted by front office for back office review and approval.

### 3. Invoice Documents
**Types:** `INVOICE`

**Workflow:** `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` → `PAID`/`OVERDUE`

**Description:** Invoices go through a review process and can be marked as paid or overdue.

### 4. Deliverable Documents
**Types:** `DELIVERABLES_PROOF`

**Workflow:** `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` → `COMPLETED`

**Description:** Deliverables are reviewed and can be marked as completed when accepted.

## Frontend Status Display

### Enhanced DocStatus Type
```typescript
export type DocStatus = 
  | "SIGNED" 
  | "RECEIVED" 
  | "PENDING" 
  | "REJECTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "PAID"
  | "COMPLETED"
  | "OVERDUE"
  | "DRAFT"
  | "ARCHIVED"
  | "EXPIRED";
```

### Status Mapping
The frontend maps backend statuses to user-friendly display statuses:
- `SENT` → `RECEIVED` (for front office users)
- `PENDING_SIGNATURE` → `PENDING`
- All other statuses map directly

## Status Validation

### Backend Validation
The system now includes comprehensive status transition validation:

1. **Agreement Workflow Validation**
   - `DRAFT` can only become `SENT`
   - `SENT` can only become `SIGNED`
   - `SIGNED` can only become `APPROVED` or `REJECTED`

2. **Form Workflow Validation**
   - `DRAFT` can only become `SUBMITTED`
   - `SUBMITTED` can only become `APPROVED` or `REJECTED`

3. **Invoice Workflow Validation**
   - `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` → `PAID`/`OVERDUE`

4. **Deliverable Workflow Validation**
   - `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` → `COMPLETED`

## CSS Styling

### Status Badge Colors
Each status has its own color scheme:

- **DRAFT**: Muted gray
- **SENT/RECEIVED**: Blue accent
- **SIGNED**: Green success
- **SUBMITTED**: Blue accent
- **UNDER_REVIEW**: Orange warning
- **APPROVED**: Green success
- **REJECTED**: Red error
- **PAID**: Green success
- **COMPLETED**: Green success
- **OVERDUE**: Red error
- **ARCHIVED**: Muted gray (with opacity)
- **EXPIRED**: Red error

## Utility Functions

### Frontend Utilities
The system includes utility functions for document type classification:

- `getDocumentWorkflowStatuses(documentType)` - Returns valid statuses for a document type
- `requiresSignatureWorkflow(documentType)` - Checks if document requires signature
- `isFormSubmission(documentType)` - Checks if document is a form submission
- `isPaymentDocument(documentType)` - Checks if document is payment-related
- `isDeliverableDocument(documentType)` - Checks if document is deliverable-related

## Implementation Benefits

1. **Consistent Workflows**: Each document type follows a logical progression
2. **Type Safety**: Status transitions are validated based on document type
3. **User Experience**: Clear visual indicators for each status
4. **Scalability**: Easy to add new document types with their own workflows
5. **Business Logic**: Enforces proper business processes and approvals

## Usage Examples

### Backend Status Update
```java
// This will be validated based on document type
document.setStatus(DocumentStatus.APPROVED);
```

### Frontend Status Display
```typescript
// Status will be automatically mapped and styled
const statusBadge = getStatusBadge(document.status);
```

### Workflow Validation
```typescript
// Check what statuses are valid for a document type
const validStatuses = getDocumentWorkflowStatuses('INVOICE');
// Returns: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID', 'OVERDUE']
```

This enhanced system provides a robust foundation for managing different document workflows while maintaining consistency and enforcing proper business processes.
