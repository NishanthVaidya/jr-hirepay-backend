import api from './api';

export interface FrontOfficeUser {
  id: string;
  email: string;
  fullName: string;
  designation: string;
  createdAt: string;
}

export interface UmbrellaAgreement {
  documentId: string;
  status: string;
  frontOfficeUserEmail: string;
  frontOfficeUserName: string;
  sentBy: string;
  sentAt: string;
  signedAt?: string;
  signerName?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  googleDriveUrl?: string;
  documentUrl?: string;
  documentName?: string;
  documentType?: string;
  notes?: string;
}

export interface SendUmbrellaAgreementRequest {
  frontOfficeUserId: string;
  notes?: string;
  document?: File;
  documentType?: string;
}

export interface SignAgreementRequest {
  documentId: string;
  signerName: string;
  hasReviewed: boolean;
  notes?: string;
}

export interface ReviewAgreementRequest {
  documentId: string;
  approved: boolean;
  notes?: string;
}

export interface SaveToGoogleDriveRequest {
  documentId: string;
  folderName: string;
}

export const umbrellaAgreementService = {
  // Get all front office users
  getFrontOfficeUsers: async (): Promise<FrontOfficeUser[]> => {
    const response = await api.get('/api/users/front-office');
    return response.data;
  },

  // Send umbrella agreement to a user with document attachment
  sendAgreement: async (request: SendUmbrellaAgreementRequest): Promise<UmbrellaAgreement> => {
    const formData = new FormData();
    formData.append('frontOfficeUserId', request.frontOfficeUserId);
    if (request.notes) {
      formData.append('notes', request.notes);
    }
    if (request.document) {
      formData.append('document', request.document);
    }
    if (request.documentType) {
      formData.append('documentType', request.documentType);
    }

    const response = await api.post('/api/umbrella-agreements/send', formData);
    return response.data;
  },

  // Sign an agreement (optionally uploading a signed document)
  signAgreement: async (request: SignAgreementRequest & { signedDocument?: File }): Promise<UmbrellaAgreement> => {
    const formData = new FormData();
    formData.append('documentId', request.documentId);
    formData.append('signerName', request.signerName);
    formData.append('hasReviewed', String(request.hasReviewed));
    if (request.notes) formData.append('notes', request.notes);
    if (request.signedDocument) formData.append('signedDocument', request.signedDocument);
    const response = await api.post('/api/umbrella-agreements/sign', formData);
    return response.data;
  },

  // Review a signed agreement
  reviewAgreement: async (request: ReviewAgreementRequest): Promise<UmbrellaAgreement> => {
    const response = await api.post('/api/umbrella-agreements/review', request);
    return response.data;
  },

  // Save to Google Drive
  saveToGoogleDrive: async (request: SaveToGoogleDriveRequest): Promise<UmbrellaAgreement> => {
    const response = await api.post('/api/umbrella-agreements/save-to-drive', request);
    return response.data;
  },

  // Get user's agreements
  getMyAgreements: async (): Promise<UmbrellaAgreement[]> => {
    const response = await api.get('/api/umbrella-agreements/my-agreements');
    return response.data;
  },

  // Get specific agreement
  getAgreement: async (documentId: string): Promise<UmbrellaAgreement> => {
    const response = await api.get(`/api/umbrella-agreements/${documentId}`);
    return response.data;
  },

  // Get pending review agreements
  getPendingReviewAgreements: async (): Promise<UmbrellaAgreement[]> => {
    const response = await api.get('/api/umbrella-agreements/pending-review');
    return response.data;
  },

  // Download document
  downloadDocument: async (documentId: string): Promise<{ blob: Blob; contentType: string }> => {
    const response = await api.get(`/api/umbrella-agreements/${documentId}/download`, {
      responseType: 'blob',
    });
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    return { blob: response.data, contentType };
  }
};
