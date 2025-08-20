import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { scopeService, Scope, ScopeDashboardResponse, ReviewScopeRequest, UserInfo } from '../services/scope';
import { umbrellaAgreementService, FrontOfficeUser } from '../services/umbrellaAgreement';

const ScopeManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<ScopeDashboardResponse | null>(null);
  const [frontOfficeUsers, setFrontOfficeUsers] = useState<FrontOfficeUser[]>([]);
  const [expandedScopeId, setExpandedScopeId] = useState<number | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject' | 'request_changes'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  const isBackOffice = currentUser?.roles.includes('BACK_OFFICE') || currentUser?.roles.includes('ADMIN');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboard, users] = await Promise.all([
        scopeService.getBackOfficeDashboard(),
        umbrellaAgreementService.getFrontOfficeUsers()
      ]);
      
      setDashboardData(dashboard);
      setFrontOfficeUsers(users);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isBackOffice) {
      loadData();
    }
  }, [isBackOffice, loadData]);

  const toggleScopeExpansion = (scopeId: number) => {
    setExpandedScopeId(expandedScopeId === scopeId ? null : scopeId);
  };

  const toggleReviewSection = (scopeId: number) => {
    if (expandedReviewId === scopeId) {
      setExpandedReviewId(null);
      setReviewNotes('');
      setReviewDecision('approve');
    } else {
      setExpandedReviewId(scopeId);
      setReviewNotes('');
      setReviewDecision('approve');
    }
  };

  const handleInlineReview = async (scope: Scope) => {
    try {
      const request: ReviewScopeRequest = {
        approved: reviewDecision === 'approve',
        requestChanges: reviewDecision === 'request_changes',
        reviewNotes: reviewNotes || undefined
      };

      await scopeService.reviewScope(scope.id, request);
      
      setExpandedReviewId(null);
      setReviewNotes('');
      setReviewDecision('approve');
      
      await loadData();
      
      let message = '';
      if (reviewDecision === 'approve') {
        message = 'Scope approved successfully!';
      } else if (reviewDecision === 'reject') {
        message = 'Scope rejected successfully!';
      } else {
        message = 'Changes requested successfully! The scope has been sent back to the front office user for amendments.';
      }
      
      alert(message);
    } catch (err) {
      setError('Failed to review scope');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      'DRAFT': 'zforms__badge--draft',
      'IN_PROGRESS': 'zforms__badge--submitted',
      'UNDER_REVIEW': 'zforms__badge--review',
      'APPROVED': 'zforms__badge--approved',
      'REJECTED': 'zforms__badge--rejected',
      'CHANGES_REQUESTED': 'zforms__badge--warning',
      'COMPLETED': 'zforms__badge--completed'
    };
    
    return (
      <span className={`zforms__badge--status ${statusClasses[status as keyof typeof statusClasses] || 'zforms__badge--status'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const renderScopeDetails = (scope: Scope) => {
    return (
      <div className="bg-gray-50 p-4 rounded-lg mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Project Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Template:</span> {scope.template || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Timeline:</span> {scope.timeline || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Due Date:</span> {scope.dueDate ? new Date(scope.dueDate).toLocaleDateString() : 'Not specified'}
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Assignment Details</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Assigned By:</span> {scope.assignedBy.fullName} ({scope.assignedBy.email})
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(scope.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(scope.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {scope.objectives && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Objectives</h4>
              <p className="text-sm text-gray-600 bg-white p-2 rounded border">{scope.objectives}</p>
            </div>
          )}
          
          {scope.deliverables && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Deliverables</h4>
              <p className="text-sm text-gray-600 bg-white p-2 rounded border">{scope.deliverables}</p>
            </div>
          )}
          
          {scope.requirements && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Requirements</h4>
              <p className="text-sm text-gray-600 bg-white p-2 rounded border">{scope.requirements}</p>
            </div>
          )}
          
          {scope.constraints && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Constraints</h4>
              <p className="text-sm text-gray-600 bg-white p-2 rounded border">{scope.constraints}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isBackOffice) {
    return (
      <div className="zform-dashboard">
        <div className="zform-dashboard-container">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="zform-dashboard">
        <div className="zform-dashboard-container">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="zform-dashboard">
      <div className="zform-dashboard-container">
        {/* Header Section */}
        <div className="zform-dashboard-header mb-12" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="zform-dashboard-icon" style={{ flexShrink: 0 }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="zform-dashboard-title">Scope Management</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="zform-error-message mb-10">
            {error}
          </div>
        )}

        {/* Pending Reviews Section */}
        {dashboardData && dashboardData.pendingReviews.length > 0 && (
          <div className="zforms mb-8">
            <div className="zforms__section">
              <div className="zforms__header">
                <div className="zforms__title">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending Reviews
                </div>
                <span className="zforms__badge">
                  {dashboardData.pendingReviews.length} pending
                </span>
              </div>
              
              <div className="zforms__table">
                <div className="zforms__head" data-columns="5">
                  <div className="zforms__cell">Title</div>
                  <div className="zforms__cell">Assigned To</div>
                  <div className="zforms__cell">Status</div>
                  <div className="zforms__cell">Created</div>
                  <div className="zforms__cell">Actions</div>
                </div>
                {dashboardData.pendingReviews.map((scope, index) => (
                  <div key={scope.id}>
                    <div className={`z-row ${index % 2 === 0 ? 'z-row--even' : 'z-row--odd'}`} data-columns="5">
                      <div className="zforms__cell" data-label="Title">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{scope.title}</div>
                            <div className="text-sm text-gray-500">{scope.description}</div>
                          </div>
                          <button
                            onClick={() => toggleScopeExpansion(scope.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {expandedScopeId === scope.id ? '▼' : '▶'}
                          </button>
                        </div>
                      </div>
                      <div className="zforms__cell" data-label="Assigned To">
                        <div className="font-medium">{scope.assignedTo.fullName}</div>
                        <div className="text-sm text-gray-500">{scope.assignedTo.email}</div>
                      </div>
                      <div className="zforms__cell" data-label="Status">
                        {getStatusBadge(scope.status)}
                      </div>
                      <div className="zforms__cell" data-label="Created">
                        {new Date(scope.createdAt).toLocaleDateString()}
                      </div>
                      <div className="zforms__cell" data-label="Actions">
                        <button
                          onClick={() => toggleReviewSection(scope.id)}
                          className="zforms__button zforms__button--primary"
                        >
                          {expandedReviewId === scope.id ? 'Hide Review' : 'Review'}
                        </button>
                      </div>
                    </div>
                    {expandedScopeId === scope.id && renderScopeDetails(scope)}
                    
                    {/* Collapsible Review Section */}
                    {expandedReviewId === scope.id && (
                      <div className="z-row z-row--review-expanded">
                        <div className="zforms__cell zforms__review-section" style={{ gridColumn: '1 / -1' }}>
                          <div className="zforms__review-content">
                            <h4 className="zforms__review-title">Review Scope</h4>
                            
                            <div className="zforms__review-info">
                              <div className="zforms__review-info-item">
                                <strong>Assigned to:</strong> {scope.assignedTo.fullName} ({scope.assignedTo.email})
                              </div>
                              <div className="zforms__review-info-item">
                                <strong>Created:</strong> {new Date(scope.createdAt).toLocaleDateString()}
                              </div>
                              <div className="zforms__review-info-item">
                                <strong>Template:</strong> {scope.template || 'Not specified'}
                              </div>
                              <div className="zforms__review-info-item">
                                <strong>Timeline:</strong> {scope.timeline || 'Not specified'}
                              </div>
                              {scope.objectives && (
                                <div className="zforms__review-info-item">
                                  <strong>Objectives:</strong> {scope.objectives}
                                </div>
                              )}
                              {scope.deliverables && (
                                <div className="zforms__review-info-item">
                                  <strong>Deliverables:</strong> {scope.deliverables}
                                </div>
                              )}
                              {scope.requirements && (
                                <div className="zforms__review-info-item">
                                  <strong>Requirements:</strong> {scope.requirements}
                                </div>
                              )}
                              {scope.constraints && (
                                <div className="zforms__review-info-item">
                                  <strong>Constraints:</strong> {scope.constraints}
                                </div>
                              )}
                            </div>
                            
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleInlineReview(scope);
                            }} className="zforms__review-form">
                              <div className="zforms__review-decision">
                                <label className="zforms__review-label">Review Decision</label>
                                <div className="zforms__review-radio-group">
                                  <label className="zforms__review-radio">
                                    <input
                                      type="radio"
                                      value="approve"
                                      checked={reviewDecision === 'approve'}
                                      onChange={() => setReviewDecision('approve')}
                                      className="zforms__radio-input"
                                    />
                                    <span className="zforms__radio-label">Approve</span>
                                  </label>
                                  <label className="zforms__review-radio">
                                    <input
                                      type="radio"
                                      value="reject"
                                      checked={reviewDecision === 'reject'}
                                      onChange={() => setReviewDecision('reject')}
                                      className="zforms__radio-input"
                                    />
                                    <span className="zforms__radio-label">Reject</span>
                                  </label>
                                  <label className="zforms__review-radio">
                                    <input
                                      type="radio"
                                      value="request_changes"
                                      checked={reviewDecision === 'request_changes'}
                                      onChange={() => setReviewDecision('request_changes')}
                                      className="zforms__radio-input"
                                    />
                                    <span className="zforms__radio-label">Request Changes</span>
                                  </label>
                                </div>
                              </div>

                              <div className="zforms__review-actions">
                                <button
                                  type="button"
                                  onClick={() => toggleReviewSection(scope.id)}
                                  className="zforms__button zforms__button--secondary"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className={`zforms__button ${
                                    reviewDecision === 'approve' 
                                      ? 'zforms__button--success' 
                                      : reviewDecision === 'reject'
                                        ? 'zforms__button--danger'
                                        : 'zforms__button--warning'
                                  }`}
                                >
                                  {reviewDecision === 'approve' ? 'Approve' : reviewDecision === 'reject' ? 'Reject' : 'Request Changes'} Scope
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Scopes Section */}
        {dashboardData && (
          <div className="zforms">
            <div className="zforms__section">
              <div className="zforms__header">
                <div className="zforms__title">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  All Scopes
                </div>
                <span className="zforms__badge">
                  {dashboardData.allScopes.length} total
                </span>
              </div>
              
              <div className="zforms__table">
                <div className="zforms__head" data-columns="5">
                  <div className="zforms__cell">Title</div>
                  <div className="zforms__cell">Assigned To</div>
                  <div className="zforms__cell">Status</div>
                  <div className="zforms__cell">Created</div>
                  <div className="zforms__cell">Actions</div>
                </div>
                {dashboardData.allScopes.map((scope, index) => (
                  <div key={scope.id}>
                    <div className={`z-row ${index % 2 === 0 ? 'z-row--even' : 'z-row--odd'}`} data-columns="5">
                      <div className="zforms__cell" data-label="Title">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{scope.title}</div>
                            <div className="text-sm text-gray-500">{scope.description}</div>
                          </div>
                          <button
                            onClick={() => toggleScopeExpansion(scope.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {expandedScopeId === scope.id ? '▼' : '▶'}
                          </button>
                        </div>
                      </div>
                      <div className="zforms__cell" data-label="Assigned To">
                        <div className="font-medium">{scope.assignedTo.fullName}</div>
                        <div className="text-sm text-gray-500">{scope.assignedTo.email}</div>
                      </div>
                      <div className="zforms__cell" data-label="Status">
                        {getStatusBadge(scope.status)}
                      </div>
                      <div className="zforms__cell" data-label="Created">
                        {new Date(scope.createdAt).toLocaleDateString()}
                      </div>
                      <div className="zforms__cell" data-label="Actions">
                        {(scope.status === 'UNDER_REVIEW' || scope.status === 'CHANGES_REQUESTED') && (
                          <button
                            onClick={() => toggleReviewSection(scope.id)}
                            className="zforms__button zforms__button--primary"
                          >
                            {expandedReviewId === scope.id ? 'Hide Review' : 'Review'}
                          </button>
                        )}
                      </div>
                    </div>
                    {expandedScopeId === scope.id && renderScopeDetails(scope)}
                    
                    {/* Collapsible Review Section for All Scopes */}
                    {expandedReviewId === scope.id && (scope.status === 'UNDER_REVIEW' || scope.status === 'CHANGES_REQUESTED') && (
                      <div className="z-row z-row--review-expanded">
                        <div className="zforms__cell zforms__review-section" style={{ gridColumn: '1 / -1' }}>
                          <div className="zforms__review-content">
                            <h4 className="zforms__review-title">Review Scope</h4>
                            
                            <div className="zforms__review-info">
                              <div className="zforms__review-info-item">
                                <strong>Assigned to:</strong> {scope.assignedTo.fullName} ({scope.assignedTo.email})
                              </div>
                              <div className="zforms__review-info-item">
                                <strong>Created:</strong> {new Date(scope.createdAt).toLocaleDateString()}
                              </div>
                              <div className="zforms__review-info-item">
                                <strong>Template:</strong> {scope.template || 'Not specified'}
                              </div>
                              <div className="zforms__review-info-item">
                                <strong>Timeline:</strong> {scope.timeline || 'Not specified'}
                              </div>
                              {scope.objectives && (
                                <div className="zforms__review-info-item">
                                  <strong>Objectives:</strong> {scope.objectives}
                                </div>
                              )}
                              {scope.deliverables && (
                                <div className="zforms__review-info-item">
                                  <strong>Deliverables:</strong> {scope.deliverables}
                                </div>
                              )}
                              {scope.requirements && (
                                <div className="zforms__review-info-item">
                                  <strong>Requirements:</strong> {scope.requirements}
                                </div>
                              )}
                              {scope.constraints && (
                                <div className="zforms__review-info-item">
                                  <strong>Constraints:</strong> {scope.constraints}
                                </div>
                              )}
                            </div>
                            
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleInlineReview(scope);
                            }} className="zforms__review-form">
                              <div className="zforms__review-decision">
                                <label className="zforms__review-label">Review Decision</label>
                                <div className="zforms__review-radio-group">
                                  <label className="zforms__review-radio">
                                    <input
                                      type="radio"
                                      value="approve"
                                      checked={reviewDecision === 'approve'}
                                      onChange={() => setReviewDecision('approve')}
                                      className="zforms__radio-input"
                                    />
                                    <span className="zforms__radio-label">Approve</span>
                                  </label>
                                  <label className="zforms__review-radio">
                                    <input
                                      type="radio"
                                      value="reject"
                                      checked={reviewDecision === 'reject'}
                                      onChange={() => setReviewDecision('reject')}
                                      className="zforms__radio-input"
                                    />
                                    <span className="zforms__radio-label">Reject</span>
                                  </label>
                                  <label className="zforms__review-radio">
                                    <input
                                      type="radio"
                                      value="request_changes"
                                      checked={reviewDecision === 'request_changes'}
                                      onChange={() => setReviewDecision('request_changes')}
                                      className="zforms__radio-input"
                                    />
                                    <span className="zforms__radio-label">Request Changes</span>
                                  </label>
                                </div>
                              </div>

                              <div className="zforms__review-actions">
                                <button
                                  type="button"
                                  onClick={() => toggleReviewSection(scope.id)}
                                  className="zforms__button zforms__button--secondary"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className={`zforms__button ${
                                    reviewDecision === 'approve' 
                                      ? 'zforms__button--success' 
                                      : reviewDecision === 'reject'
                                        ? 'zforms__button--danger'
                                        : 'zforms__button--warning'
                                  }`}
                                >
                                  {reviewDecision === 'approve' ? 'Approve' : reviewDecision === 'reject' ? 'Reject' : 'Request Changes'} Scope
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScopeManagement;