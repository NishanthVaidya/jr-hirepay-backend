import { UmbrellaAgreement, FrontOfficeUser } from '../services/umbrellaAgreement';

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

export type DocumentItem = {
  id: string;
  title: string;          // e.g., "Umbrella Agreement"
  type: string;           // e.g., "Agreement"
  status: DocStatus;      // approved docs are SIGNED
  updatedAt: string;      // ISO date
  downloadUrl?: string;
  viewUrl?: string;
  notes?: string;
};

export type UserItem = {
  id: string;
  name: string;           // used for sorting & search
  email?: string;
  documents: DocumentItem[];
};

/**
 * Transform the existing UmbrellaAgreement data to the format expected by ApprovedDocumentsBrowser
 * Shows documents that have been signed and/or approved (finalized documents)
 */
export function transformToApprovedDocumentsBrowser(
  agreements: UmbrellaAgreement[],
  frontOfficeUsers: FrontOfficeUser[]
): UserItem[] {
  // Create a map of users with their documents
  const userMap = new Map<string, UserItem>();

  // Process each agreement
  agreements.forEach(agreement => {
    // Include both SIGNED and APPROVED documents (finalized documents)
    if (agreement.status !== 'SIGNED' && agreement.status !== 'APPROVED') {
      return;
    }

    const userEmail = agreement.frontOfficeUserEmail;
    const userName = agreement.frontOfficeUserName;

    // Find or create user
    if (!userMap.has(userEmail)) {
      // Find the user in frontOfficeUsers to get the full name
      const userInfo = frontOfficeUsers.find(u => u.email === userEmail);
      
      userMap.set(userEmail, {
        id: userEmail, // Use email as ID for consistency
        name: userInfo?.fullName || userName, // Use full name if available, fallback to userName
        email: userEmail,
        documents: []
      });
    }

    const user = userMap.get(userEmail)!;

    // Create document item
    const documentItem: DocumentItem = {
      id: agreement.documentId,
      title: getDocumentTypeLabel(agreement.documentType || 'UMBRELLA_AGREEMENT'),
      type: getDocumentTypeCategory(agreement.documentType || 'UMBRELLA_AGREEMENT'),
      status: mapStatus(agreement.status),
      updatedAt: agreement.signedAt || agreement.sentAt,
      downloadUrl: agreement.documentUrl,
      viewUrl: agreement.documentUrl,
      notes: agreement.notes
    };

    user.documents.push(documentItem);
  });

  // Convert map to array and sort users alphabetically
  return Array.from(userMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Map the existing status to the new DocStatus type
 */
function mapStatus(status: string): DocStatus {
  switch (status) {
    case 'SIGNED':
      return 'SIGNED';
    case 'SENT':
      return 'RECEIVED';
    case 'PENDING_SIGNATURE':
      return 'PENDING';
    case 'REJECTED':
      return 'REJECTED';
    case 'SUBMITTED':
      return 'SUBMITTED';
    case 'UNDER_REVIEW':
      return 'UNDER_REVIEW';
    case 'APPROVED':
      return 'APPROVED';
    case 'PAID':
      return 'PAID';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'OVERDUE':
      return 'OVERDUE';
    case 'DRAFT':
      return 'DRAFT';
    case 'ARCHIVED':
      return 'ARCHIVED';
    case 'EXPIRED':
      return 'EXPIRED';
    default:
      return 'PENDING';
  }
}

/**
 * Get a human-readable label for document type
 */
function getDocumentTypeLabel(documentType: string): string {
  const labels: Record<string, string> = {
    'UMBRELLA_AGREEMENT': 'Umbrella Agreement',
    'TAX_FORM_W9': 'Tax Form W-9',
    'TAX_FORM_W8BEN': 'Tax Form W-8BEN',
    'PAYMENT_AUTH_FORM': 'Payment Authorization Form',
    'TASK_ORDER': 'Task Order',
    'AGREEMENT_MODIFICATION': 'Agreement Modification',
    'TASK_ORDER_MODIFICATION': 'Task Order Modification',
    'INVOICE': 'Invoice',
    'DELIVERABLES_PROOF': 'Deliverables Proof'
  };
  
  return labels[documentType] || documentType;
}

/**
 * Get a category for the document type
 */
function getDocumentTypeCategory(documentType: string): string {
  const categories: Record<string, string> = {
    'UMBRELLA_AGREEMENT': 'Agreement',
    'TAX_FORM_W9': 'Tax Form',
    'TAX_FORM_W8BEN': 'Tax Form',
    'PAYMENT_AUTH_FORM': 'Authorization',
    'TASK_ORDER': 'Order',
    'AGREEMENT_MODIFICATION': 'Modification',
    'TASK_ORDER_MODIFICATION': 'Modification',
    'INVOICE': 'Invoice',
    'DELIVERABLES_PROOF': 'Proof'
  };
  
  return categories[documentType] || 'Document';
}

/**
 * Get the appropriate workflow statuses for a document type
 */
export function getDocumentWorkflowStatuses(documentType: string): string[] {
  const workflows: Record<string, string[]> = {
    // Agreement documents - require signature workflow
    'UMBRELLA_AGREEMENT': ['DRAFT', 'SENT', 'SIGNED', 'APPROVED', 'REJECTED'],
    'AGREEMENT_MODIFICATION': ['DRAFT', 'SENT', 'SIGNED', 'APPROVED', 'REJECTED'],
    'TASK_ORDER': ['DRAFT', 'SENT', 'SIGNED', 'APPROVED', 'REJECTED'],
    'TASK_ORDER_MODIFICATION': ['DRAFT', 'SENT', 'SIGNED', 'APPROVED', 'REJECTED'],
    
    // Form documents - submission workflow
    'TAX_FORM_W9': ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
    'TAX_FORM_W8BEN': ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
    'PAYMENT_AUTH_FORM': ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'],
    
    // Invoice documents - payment workflow
    'INVOICE': ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PAID', 'OVERDUE'],
    
    // Deliverable documents - completion workflow
    'DELIVERABLES_PROOF': ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED']
  };
  
  return workflows[documentType] || ['DRAFT', 'SENT', 'SIGNED', 'APPROVED', 'REJECTED'];
}

/**
 * Check if a document type requires signature workflow
 */
export function requiresSignatureWorkflow(documentType: string): boolean {
  const signatureWorkflowTypes = [
    'UMBRELLA_AGREEMENT',
    'AGREEMENT_MODIFICATION', 
    'TASK_ORDER',
    'TASK_ORDER_MODIFICATION'
  ];
  
  return signatureWorkflowTypes.includes(documentType);
}

/**
 * Check if a document type is a form submission
 */
export function isFormSubmission(documentType: string): boolean {
  const formTypes = [
    'TAX_FORM_W9',
    'TAX_FORM_W8BEN',
    'PAYMENT_AUTH_FORM'
  ];
  
  return formTypes.includes(documentType);
}

/**
 * Check if a document type is payment-related
 */
export function isPaymentDocument(documentType: string): boolean {
  return documentType === 'INVOICE';
}

/**
 * Check if a document type is deliverable-related
 */
export function isDeliverableDocument(documentType: string): boolean {
  return documentType === 'DELIVERABLES_PROOF';
}
