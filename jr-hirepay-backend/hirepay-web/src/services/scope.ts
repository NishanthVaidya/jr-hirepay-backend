import api from './api';

export interface Scope {
  id: number;
  title: string;
  description: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  assignedTo: UserInfo;
  assignedBy: UserInfo;
  reviewedBy?: UserInfo;
  template?: string;
  objectives?: string;
  deliverables?: string;
  timeline?: string;
  requirements?: string;
  constraints?: string;
  reviewNotes?: string;
  dueDate?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;

}



export interface UserInfo {
  id: number;
  email: string;
  fullName: string;
  designation: string;
}

export interface CreateScopeRequest {
  title: string;
  description: string;
  assignedToUserId: number;
  template?: string;
  objectives?: string;
  deliverables?: string;
  timeline?: string;
  requirements?: string;
  constraints?: string;
  dueDate?: string;
}

export interface UpdateScopeRequest {
  title: string;
  description: string;
  objectives?: string;
  deliverables?: string;
  timeline?: string;
  requirements?: string;
  constraints?: string;
  dueDate?: string;
}

export interface ReviewScopeRequest {
  approved: boolean;
  reviewNotes?: string;
}



export interface ScopeDashboardResponse {
  allScopes: Scope[];
  pendingReviews: Scope[];
  myAssignedScopes: Scope[];
  stats: ScopeStats;
}

export interface ScopeStats {
  totalScopes: number;
  draftScopes: number;
  inProgressScopes: number;
  underReviewScopes: number;
  approvedScopes: number;
  rejectedScopes: number;
  completedScopes: number;
}

export const scopeService = {
  // Create a new scope assignment
  createScope: async (request: CreateScopeRequest): Promise<Scope> => {
    const response = await api.post('/api/scopes', request);
    return response.data;
  },

  // Get scope by ID
  getScopeById: async (scopeId: number): Promise<Scope> => {
    const response = await api.get(`/api/scopes/${scopeId}`);
    return response.data;
  },

  // Update scope details
  updateScope: async (scopeId: number, request: UpdateScopeRequest): Promise<Scope> => {
    const response = await api.put(`/api/scopes/${scopeId}`, request);
    return response.data;
  },

  // Review scope (approve/reject)
  reviewScope: async (scopeId: number, request: ReviewScopeRequest): Promise<Scope> => {
    const response = await api.post(`/api/scopes/${scopeId}/review`, request);
    return response.data;
  },



  // Back Office: Get dashboard data
  getBackOfficeDashboard: async (): Promise<ScopeDashboardResponse> => {
    const response = await api.get('/api/scopes/dashboard');
    return response.data;
  },

  // Front Office: Get my scopes
  getMyScopes: async (): Promise<Scope[]> => {
    const response = await api.get('/api/scopes/my-scopes');
    return response.data;
  },

  // Back Office: Get scopes assigned by me
  getScopesAssignedByMe: async (): Promise<Scope[]> => {
    const response = await api.get('/api/scopes/assigned-by-me');
    return response.data;
  },

  // Get scopes that need review
  getScopesNeedingReview: async (): Promise<Scope[]> => {
    const response = await api.get('/api/scopes/pending-review');
    return response.data;
  },

  // Front Office: Submit scope for review
  submitScopeForReview: async (scopeId: number): Promise<Scope> => {
    const response = await api.post(`/api/scopes/${scopeId}/submit`);
    return response.data;
  }
};

