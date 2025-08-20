import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { scopeService, Scope, UpdateScopeRequest } from '../services/scope';

const MyScopes: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myScopes, setMyScopes] = useState<Scope[]>([]);
  const [selectedScope, setSelectedScope] = useState<Scope | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedEditId, setExpandedEditId] = useState<number | null>(null);
    const [expandedScopeId, setExpandedScopeId] = useState<number | null>(null);

  // Add specific styling for My Scopes table to fix column alignment
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* My Scopes table specific styling - 5 columns */
      .zforms .zforms__section .zforms__table {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
      }
      
      .zforms .zforms__section .zforms__head {
        display: grid !important;
        grid-template-columns: 2fr 1fr 1.5fr 1fr 1.5fr !important;
        gap: 1rem !important;
        padding: 1rem 2rem !important;
        background: var(--zforms-surface) !important;
        border-bottom: 2px solid var(--zforms-border) !important;
        font-weight: 600 !important;
        font-size: 0.75rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        color: var(--zforms-muted) !important;
      }
      
      .zforms .zforms__section .z-row {
        display: grid !important;
        grid-template-columns: 2fr 1fr 1.5fr 1fr 1.5fr !important;
        gap: 1rem !important;
        padding: 1rem 2rem !important;
        border-bottom: 1px solid var(--zforms-border) !important;
        transition: all 0.2s ease !important;
        min-height: 80px !important;
        align-items: center !important;
        background: var(--zforms-surface) !important;
      }
      
      .zforms .zforms__section .z-row:hover {
        background: var(--zforms-bg) !important;
        box-shadow: var(--zforms-shadow) !important;
        transform: translateY(-1px) !important;
      }
      
      .zforms .zforms__section .zforms__cell {
        padding: 0.75rem 0 !important;
        display: flex !important;
        align-items: center !important;
        min-width: 0 !important;
      }
      
      /* Title column - left aligned */
      .zforms .zforms__section .zforms__cell[data-label="Title"] {
        justify-content: flex-start !important;
        align-items: flex-start !important;
      }
      
      /* Status column - center aligned */
      .zforms .zforms__section .zforms__cell[data-label="Status"] {
        justify-content: center !important;
        align-items: center !important;
      }
      
      /* Assigned By column - center aligned */
      .zforms .zforms__section .zforms__cell[data-label="Assigned By"] {
        justify-content: center !important;
        align-items: center !important;
      }
      
      /* Created column - center aligned */
      .zforms .zforms__section .zforms__cell[data-label="Created"] {
        justify-content: center !important;
        align-items: center !important;
      }
      
      /* Actions column - center aligned */
      .zforms .zforms__section .zforms__cell[data-label="Actions"] {
        justify-content: center !important;
        align-items: center !important;
      }
      
      /* Expanded row styles */
      .zforms .zforms__section .z-row--edit-expanded,
      .zforms .zforms__section .z-row--details-expanded {
        display: contents !important;
        grid-column: 1 / -1 !important;
        background: var(--zforms-bg) !important;
        border: 1px solid var(--zforms-border) !important;
        border-radius: var(--zforms-radius) !important;
        margin: 0.5rem 0 !important;
      }
      
      .zforms .zforms__section .zforms__edit-section,
      .zforms .zforms__section .zforms__details-section {
        grid-column: 1 / -1 !important;
        background: var(--zforms-bg) !important;
        border: 1px solid var(--zforms-border) !important;
        border-radius: var(--zforms-radius) !important;
        margin: 0.5rem 0 !important;
        padding: 1rem !important;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .zforms .zforms__section .zforms__head {
          display: none !important;
        }
        
        .zforms .zforms__section .z-row {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.75rem !important;
          padding: 1rem !important;
          margin-bottom: 1rem !important;
          border: 1px solid var(--zforms-border) !important;
          border-radius: var(--zforms-radius) !important;
          background: var(--zforms-surface) !important;
          box-shadow: var(--zforms-shadow) !important;
        }
        
        .zforms .zforms__section .zforms__cell {
          padding: 0 !important;
          border-bottom: 1px solid var(--zforms-border) !important;
          padding-bottom: 0.75rem !important;
          justify-content: flex-start !important;
          align-items: flex-start !important;
        }
        
        .zforms .zforms__section .zforms__cell:last-child {
          border-bottom: none !important;
          padding-bottom: 0 !important;
        }
        
        /* Mobile labels */
        .zforms .zforms__section .zforms__cell::before {
          content: attr(data-label) !important;
          display: block !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          color: var(--zforms-muted) !important;
          margin-bottom: 0.25rem !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Edit form state
  const [editForm, setEditForm] = useState<UpdateScopeRequest>({
    title: '',
    description: '',
    objectives: '',
    deliverables: '',
    timeline: '',
    requirements: '',
    constraints: '',
    dueDate: ''
  });

  const loadMyScopes = useCallback(async () => {
    try {
      setLoading(true);
      const scopes = await scopeService.getMyScopes();
      setMyScopes(scopes);
    } catch (err) {
      setError('Failed to load your scopes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyScopes();
  }, [loadMyScopes]);

  const handleEditScope = (scope: Scope) => {
    setSelectedScope(scope);
    setEditForm({
      title: scope.title,
      description: scope.description,
      objectives: scope.objectives || '',
      deliverables: scope.deliverables || '',
      timeline: scope.timeline || '',
      requirements: scope.requirements || '',
      constraints: scope.constraints || '',
      dueDate: scope.dueDate ? new Date(scope.dueDate).toISOString().split('T')[0] : ''
    });
    setExpandedEditId(expandedEditId === scope.id ? null : scope.id);
  };

  const handleUpdateScope = async () => {
    if (!selectedScope) return;

    try {
      setSubmitting(true);
      
      // Convert date to proper format for backend
      const updateRequest = {
        ...editForm,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate + 'T00:00:00.000Z').toISOString() : undefined
      };
      
      await scopeService.updateScope(selectedScope.id, updateRequest);
      
      // Refresh the scopes list
      await loadMyScopes();
      
      setExpandedEditId(null);
      setSelectedScope(null);
      toast.success('Scope updated successfully!');
    } catch (err) {
      setError('Failed to update scope');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartWork = async (scope: Scope) => {
    try {
      await scopeService.startWorkOnScope(scope.id);
      await loadMyScopes(); // Refresh the list
      toast.success('Scope marked as in progress!');
    } catch (err) {
      setError('Failed to update scope status');
      console.error(err);
    }
  };

  const handleSubmitForReview = async (scope: Scope) => {
    try {
      await scopeService.submitScopeForReview(scope.id);
      await loadMyScopes(); // Refresh the list
      toast.success('Scope submitted for review successfully!');
    } catch (err) {
      setError('Failed to submit scope for review');
      console.error(err);
    }
  };

  const toggleScopeExpansion = (scopeId: number) => {
    setExpandedScopeId(expandedScopeId === scopeId ? null : scopeId);
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
              {scope.reviewedBy && (
                <div>
                  <span className="font-medium">Reviewed By:</span> {scope.reviewedBy.fullName} ({scope.reviewedBy.email})
                </div>
              )}
              {scope.reviewedAt && (
                <div>
                  <span className="font-medium">Reviewed At:</span> {new Date(scope.reviewedAt).toLocaleDateString()}
                </div>
              )}
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

  const canEdit = (scope: Scope) => {
    return scope.status === 'DRAFT' || scope.status === 'IN_PROGRESS' || scope.status === 'CHANGES_REQUESTED';
  };

  const canStartWork = (scope: Scope) => {
    return scope.status === 'DRAFT';
  };

  const canSubmitForReview = (scope: Scope) => {
    return scope.status === 'DRAFT' || scope.status === 'IN_PROGRESS' || scope.status === 'CHANGES_REQUESTED';
  };

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
            <h1 className="zform-dashboard-title">My Scopes</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="zform-error-message mb-10">
            {error}
          </div>
        )}

        {/* Scopes List */}
        <div className="zforms">
          <div className="zforms__section">
            <div className="zforms__header">
              <div className="zforms__title">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Assigned Scopes
              </div>
              <span className="zforms__badge">
                {myScopes.length} total
              </span>
            </div>
            
            {myScopes.length === 0 ? (
              <div className="zforms__content">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No scopes have been assigned to you yet.</p>
                  <p className="text-gray-400 text-sm">Please contact your administrator to have scopes assigned to you.</p>
                </div>
              </div>
            ) : (
              <div className="zforms__table">
                <div className="zforms__head">
                  <div className="zforms__cell">Title</div>
                  <div className="zforms__cell">Status</div>
                  <div className="zforms__cell">Assigned By</div>
                  <div className="zforms__cell">Created</div>
                  <div className="zforms__cell">Actions</div>
                </div>
                {myScopes.map((scope, index) => (
                  <React.Fragment key={scope.id}>
                    <div className={`z-row ${index % 2 === 0 ? 'z-row--even' : 'z-row--odd'}`}>
                      <div className="zforms__cell" data-label="Title">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{scope.title}</div>
                            <div className="text-sm text-gray-500">{scope.description}</div>
                            {scope.status === 'CHANGES_REQUESTED' && scope.reviewNotes && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                                <div className="font-medium text-amber-800">Review Notes:</div>
                                <div className="text-amber-700">{scope.reviewNotes}</div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => toggleScopeExpansion(scope.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {expandedScopeId === scope.id ? '▼' : '▶'}
                          </button>
                        </div>
                      </div>
                      <div className="zforms__cell" data-label="Status">
                        {getStatusBadge(scope.status)}
                      </div>
                      <div className="zforms__cell" data-label="Assigned By">
                        <div className="font-medium">{scope.assignedBy.fullName}</div>
                      </div>
                      <div className="zforms__cell" data-label="Created">
                        {new Date(scope.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="zforms__cell" data-label="Actions">
                        <div className="flex flex-wrap gap-2 min-w-[200px]">
                          {canStartWork(scope) && (
                            <button
                              onClick={() => handleStartWork(scope)}
                              className="zforms__button zforms__button--primary text-xs px-3 py-1"
                            >
                              Start Work
                            </button>
                          )}
                          {canEdit(scope) && (
                            <button
                              onClick={() => handleEditScope(scope)}
                              className="zforms__button zforms__button--primary text-xs px-3 py-1"
                            >
                              {expandedEditId === scope.id ? 'Hide Edit' : 'Edit'}
                            </button>
                          )}
                          {scope.status === 'CHANGES_REQUESTED' && (
                            <button
                              onClick={() => handleSubmitForReview(scope)}
                              className="zforms__button zforms__button--warning text-xs px-3 py-1"
                            >
                              Update & Resubmit
                            </button>
                          )}
                          {canSubmitForReview(scope) && scope.status !== 'CHANGES_REQUESTED' && (
                            <button
                              onClick={() => handleSubmitForReview(scope)}
                              className="zforms__button zforms__button--secondary text-xs px-3 py-1"
                            >
                              Submit for Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Collapsible Scope Details */}
                    {expandedScopeId === scope.id && (
                      <div className="z-row z-row--details-expanded">
                        <div className="zforms__details-section">
                          {renderScopeDetails(scope)}
                        </div>
                      </div>
                    )}
                    
                    {/* Collapsible Edit Form */}
                    {expandedEditId === scope.id && (
                      <div className="z-row z-row--edit-expanded">
                        <div className="zforms__edit-section">
                          <div className="zforms__edit-content">
                            <div className="zforms__edit-form">
                              <div className="zforms__form-grid">
                                <div className="zforms__form-field">
                                  <label className="zforms__form-label">Project Title *</label>
                                  <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="zforms__form-input"
                                  />
                                </div>
                                <div className="zforms__form-field">
                                  <label className="zforms__form-label">Timeline</label>
                                  <input
                                    type="text"
                                    value={editForm.timeline}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, timeline: e.target.value }))}
                                    className="zforms__form-input"
                                    placeholder="e.g., 3 months, 6 weeks"
                                  />
                                </div>
                              </div>

                              <div className="zforms__form-field">
                                <label className="zforms__form-label">Project Description *</label>
                                <textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                  className="zforms__form-textarea"
                                  rows={3}
                                />
                              </div>

                              <div className="zforms__form-field">
                                <label className="zforms__form-label">Objectives</label>
                                <textarea
                                  value={editForm.objectives}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, objectives: e.target.value }))}
                                  className="zforms__form-textarea"
                                  rows={2}
                                />
                              </div>

                              <div className="zforms__form-field">
                                <label className="zforms__form-label">Deliverables</label>
                                <textarea
                                  value={editForm.deliverables}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, deliverables: e.target.value }))}
                                  className="zforms__form-textarea"
                                  rows={3}
                                />
                              </div>

                              <div className="zforms__form-grid">
                                <div className="zforms__form-field">
                                  <label className="zforms__form-label">Requirements</label>
                                  <input
                                    type="text"
                                    value={editForm.requirements}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, requirements: e.target.value }))}
                                    className="zforms__form-input"
                                  />
                                </div>
                                <div className="zforms__form-field">
                                  <label className="zforms__form-label">Due Date</label>
                                  <input
                                    type="date"
                                    value={editForm.dueDate}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                    className="zforms__form-input"
                                  />
                                </div>
                              </div>

                              <div className="zforms__form-field">
                                <label className="zforms__form-label">Constraints</label>
                                <textarea
                                  value={editForm.constraints}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, constraints: e.target.value }))}
                                  className="zforms__form-textarea"
                                  rows={2}
                                />
                              </div>

                              <div className="zforms__form-actions">
                                <button
                                  onClick={() => setExpandedEditId(null)}
                                  className="zforms__button zforms__button--secondary"
                                  style={{ marginRight: '1rem' }}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleUpdateScope}
                                  disabled={submitting}
                                  className="zforms__button zforms__button--primary"
                                >
                                  {submitting ? 'Updating...' : 'Update Scope'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

export default MyScopes;
