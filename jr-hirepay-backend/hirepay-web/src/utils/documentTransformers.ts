import { UmbrellaAgreement, FrontOfficeUser } from '../services/umbrellaAgreement';

export type DocStatus = "SIGNED" | "RECEIVED" | "PENDING" | "REJECTED";

export type DocumentItem = {
  id: string;
  title: string;          // e.g., "Umbrella Agreement"
  type: string;           // e.g., "Agreement"
  status: DocStatus;      // approved docs are SIGNED
  updatedAt: string;      // ISO date
  downloadUrl?: string;
  viewUrl?: string;
};

export type UserItem = {
  id: string;
  name: string;           // used for sorting & search
  email?: string;
  documents: DocumentItem[];
};

/**
 * Transform the existing UmbrellaAgreement data to the format expected by ApprovedDocumentsBrowser
 */
export function transformToApprovedDocumentsBrowser(
  agreements: UmbrellaAgreement[],
  frontOfficeUsers: FrontOfficeUser[]
): UserItem[] {
  // Create a map of users with their documents
  const userMap = new Map<string, UserItem>();

  // Process each agreement
  agreements.forEach(agreement => {
    // Only include SIGNED documents (approved documents)
    if (agreement.status !== 'SIGNED') {
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
      viewUrl: agreement.documentUrl
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
