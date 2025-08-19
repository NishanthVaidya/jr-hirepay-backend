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

  // Add custom styles for better table layout
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Improved table layout with proper alignment - using !important to override global styles */
      .zforms .zforms__section .zforms__table {
        display: grid !important;
        grid-template-columns: 2fr 1fr 1.5fr 1fr 1.5fr !important;
        gap: 1rem !important;
        padding: 1rem !important;
        background: #f8fafc !important;
        border-radius: 0.75rem !important;
        border: 1px solid #e2e8f0 !important;
        flex-direction: unset !important;
        width: 100% !important;
      }
      
      .zforms .zforms__section .zforms__head {
        display: contents !important;
        grid-template-columns: unset !important;
        gap: unset !important;
        padding: unset !important;
        background: unset !important;
        border-bottom: unset !important;
        position: unset !important;
        top: unset !important;
        z-index: unset !important;
        font-weight: unset !important;
        font-size: unset !important;
        text-transform: unset !important;
        letter-spacing: unset !important;
        color: unset !important;
      }
      
      .zforms .zforms__section .zforms__head .zforms__cell {
        background: #1e293b !important;
        color: #f1f5f9 !important;
        padding: 1rem !important;
        font-weight: 600 !important;
        text-align: left !important;
        border-radius: 0.5rem !important;
        border: 1px solid #334155 !important;
        font-size: 0.75rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
      }
      
      .zforms .zforms__section .z-row {
        display: contents !important;
        grid-template-columns: unset !important;
        gap: unset !important;
        padding: unset !important;
        border-bottom: unset !important;
        transition: unset !important;
        min-height: unset !important;
        align-items: unset !important;
        background: unset !important;
      }
      
      .zforms .zforms__section .z-row .zforms__cell {
        background: white !important;
        padding: 1rem !important;
        text-align: left !important;
        border-radius: 0.5rem !important;
        border: 1px solid #e2e8f0 !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: flex-start !important;
        min-height: 80px !important;
        transition: all 0.2s ease !important;
        min-width: unset !important;
      }
      
      /* Title column - proper left alignment */
      .zforms .zforms__section .zforms__cell[data-label="Title"] {
        text-align: left !important;
        align-items: flex-start !important;
        justify-content: flex-start !important;
      }
      
      .zforms .zforms__section .zforms__cell[data-label="Title"] .flex {
        width: 100% !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
      }
      
      /* Status badges - center them within the column */
      .zforms .zforms__section .zforms__cell[data-label="Status"] {
        justify-content: center !important;
        align-items: center !important;
        text-align: center !important;
      }
      
      .zforms .zforms__section .zforms__cell[data-label="Status"] .zforms__badge--status {
        margin: 0 auto !important;
      }
      
      /* Assigned By - center the name */
      .zforms .zforms__section .zforms__cell[data-label="Assigned By"] {
        justify-content: center !important;
        align-items: center !important;
        text-align: center !important;
      }
      
      /* Created date - center it */
      .zforms .zforms__section .zforms__cell[data-label="Created"] {
        justify-content: center !important;
        align-items: center !important;
        text-align: center !important;
        font-size: 0.875rem !important;
      }
      
      /* Actions - center the buttons */
      .zforms .zforms__section .zforms__cell[data-label="Actions"] {
        justify-content: center !important;
        align-items: center !important;
        text-align: center !important;
        min-width: auto !important;
      }
      
      .zforms .zforms__section .zforms__cell[data-label="Actions"] .flex {
        justify-content: center !important;
        gap: 0.5rem !important;
        flex-wrap: wrap !important;
        width: 100% !important;
      }
      
      .zforms .zforms__section .zforms__cell[data-label="Actions"] button {
        white-space: nowrap !important;
        font-size: 0.75rem !important;
        padding: 0.5rem 0.75rem !important;
        margin: 0.25rem !important;
      }
      
      /* Hover effects */
      .zforms .zforms__section .z-row:hover .zforms__cell {
        background: #f8fafc !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      }
      
      /* Expanded row styles */
      .zforms .zforms__section .z-row--edit-expanded,
      .zforms .zforms__section .z-row--details-expanded {
        display: contents !important;
        grid-column: 1 / -1 !important;
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 0.5rem !important;
        margin: 0.5rem 0 !important;
      }
      
      .zforms .zforms__section .zforms__edit-section,
      .zforms .zforms__section .zforms__details-section {
        grid-column: 1 / -1 !important;
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 0.5rem !important;
        margin: 0.5rem 0 !important;
        padding: 1rem !important;
      }
      
      .zforms .zforms__section .zforms__edit-content {
        background: white !important;
        border-radius: 0.5rem !important;
        padding: 1.5rem !important;
        border: 1px solid #e2e8f0 !important;
      }
      
      /* Scope details expanded section */
      .zforms .zforms__section .bg-gray-50 {
        grid-column: 1 / -1 !important;
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 0.5rem !important;
        margin: 0.5rem 0 !important;
        padding: 1rem !important;
      }
      
      /* Responsive design */
      @media (max-width: 1024px) {
        .zforms .zforms__section .zforms__table {
          grid-template-columns: 2fr 1fr 1.5fr 1fr 1.5fr !important;
          gap: 0.75rem !important;
          padding: 0.75rem !important;
        }
        
        .zforms .zforms__section .z-row .zforms__cell {
          padding: 0.75rem !important;
          min-height: 70px !important;
        }
      }
      
      @media (max-width: 768px) {
        .zforms .zforms__section .zforms__table {
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
        }
        
        .zforms .zforms__section .zforms__head {
          display: none !important;
        }
        
        .zforms .zforms__section .z-row {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 0.5rem !important;
          background: white !important;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        .zforms .zforms__section .z-row .zforms__cell {
          border: none !important;
          padding: 0.5rem 0 !important;
          min-height: auto !important;
          text-align: left !important;
          justify-content: flex-start !important;
          align-items: flex-start !important;
        }
        
        .zforms .zforms__section .zforms__cell[data-label="Actions"] {
          justify-content: flex-start !important;
        }
        
        .zforms .zforms__section .zforms__cell[data-label="Actions"] .flex {
          justify-content: flex-start !important;
        }
        
        /* Mobile labels */
        .zforms .zforms__section .zforms__cell::before {
          content: attr(data-label) !important;
          display: block !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
          color: #64748b !important;
          margin-bottom: 0.25rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        
        /* Mobile expanded content */
        .zforms .zforms__section .z-row--edit-expanded,
        .zforms .zforms__section .z-row--details-expanded {
          grid-column: 1 !important;
          margin: 0.5rem 0 !important;
        }
        
        .zforms .zforms__section .zforms__edit-section,
        .zforms .zforms__section .zforms__details-section {
          grid-column: 1 !important;
          margin: 0.5rem 0 !important;
        }
        
        .zforms .zforms__section .bg-gray-50 {
          grid-column: 1 !important;
          margin: 0.5rem 0 !important;
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
        <div className="zform-dashboard-header mb-12">
          <div className="zform-dashboard-icon">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="zform-dashboard-title">My Scopes</h1>
            <p className="zform-dashboard-subtitle">
              Welcome, {currentUser?.fullName} ({currentUser?.designation})
            </p>
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
