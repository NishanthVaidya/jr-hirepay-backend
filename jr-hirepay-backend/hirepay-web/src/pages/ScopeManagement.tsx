import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { scopeService, Scope, ScopeDashboardResponse, CreateScopeRequest, ReviewScopeRequest, UserInfo } from '../services/scope';
import { umbrellaAgreementService, FrontOfficeUser } from '../services/umbrellaAgreement';

const ScopeManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<ScopeDashboardResponse | null>(null);
  const [frontOfficeUsers, setFrontOfficeUsers] = useState<FrontOfficeUser[]>([]);
  const [selectedScope, setSelectedScope] = useState<Scope | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  // Create scope form state
  const [createForm, setCreateForm] = useState<CreateScopeRequest>({
    title: '',
    description: '',
    assignedToUserId: 0,
    template: '',
    objectives: '',
    deliverables: '',
    timeline: '',
    requirements: '',
    constraints: '',
    dueDate: ''
  });

  const isBackOffice = currentUser?.roles.includes('BACK_OFFICE') || currentUser?.roles.includes('ADMIN');

  // Scope templates
  const scopeTemplates = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Design', label: 'Design' },
    { value: 'Data Analysis', label: 'Data Analysis' },
    { value: 'Custom', label: 'Custom' }
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
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

  const handleCreateScope = async () => {
    if (!createForm.title || !createForm.description || !createForm.assignedToUserId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await scopeService.createScope(createForm);
      setShowCreateForm(false);
      setCreateForm({
        title: '',
        description: '',
        assignedToUserId: 0,
        template: '',
        objectives: '',
        deliverables: '',
        timeline: '',
        requirements: '',
        constraints: '',
        dueDate: ''
      });
      loadData();
      alert('Scope created successfully!');
    } catch (err) {
      setError('Failed to create scope');
      console.error(err);
    }
  };

  const handleReviewScope = async () => {
    if (!selectedScope) return;

    try {
      const request: ReviewScopeRequest = {
        approved: reviewDecision === 'approve',
        reviewNotes: reviewNotes || undefined
      };

      await scopeService.reviewScope(selectedScope.id, request);
      setShowReviewForm(false);
      setReviewDecision('approve');
      setReviewNotes('');
      setSelectedScope(null);
      loadData();
      alert(`Scope ${reviewDecision === 'approve' ? 'approved' : 'rejected'} successfully!`);
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
      'COMPLETED': 'zforms__badge--completed'
    };
    
    return (
      <span className={`zforms__badge--status ${statusClasses[status as keyof typeof statusClasses] || 'zforms__badge--status'}`}>
        {status.replace('_', ' ')}
      </span>
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
        <div className="zform-dashboard-header mb-12">
          <div className="zform-dashboard-icon">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="zform-dashboard-title">Scope Management</h1>
            <p className="zform-dashboard-subtitle">
              Welcome, {currentUser?.email} ({currentUser?.designation})
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="zform-error-message mb-10">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        {dashboardData && (
          <div className="zforms mb-8">
            <div className="zforms__section">
              <div className="zforms__header">
                <div className="zforms__title">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Scope Statistics
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.stats.totalScopes}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-500">{dashboardData.stats.draftScopes}</div>
                  <div className="text-sm text-gray-600">Draft</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{dashboardData.stats.inProgressScopes}</div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{dashboardData.stats.underReviewScopes}</div>
                  <div className="text-sm text-gray-600">Under Review</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{dashboardData.stats.approvedScopes}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{dashboardData.stats.rejectedScopes}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{dashboardData.stats.completedScopes}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create New Scope Section */}
        <div className="zforms mb-8">
          <div className="zforms__section">
            <div className="zforms__header">
              <div className="zforms__title">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Scope
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="zforms__button zforms__button--primary"
              >
                {showCreateForm ? 'Cancel' : 'Create Scope'}
              </button>
            </div>
            
            {showCreateForm && (
              <div className="zforms__content">
                <div className="zforms__form-grid">
                  <div className="zforms__form-field">
                    <label className="zforms__form-label">Project Title *</label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      className="zforms__form-input"
                      placeholder="Enter project title"
                    />
                  </div>

                  <div className="zforms__form-field">
                    <label className="zforms__form-label">Assign To *</label>
                    <select
                      value={createForm.assignedToUserId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, assignedToUserId: Number(e.target.value) }))}
                      className="zforms__form-input"
                    >
                      <option value={0}>Choose a user...</option>
                      {frontOfficeUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.designation} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">Project Description *</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="zforms__form-textarea"
                    rows={3}
                    placeholder="Describe the project objectives and goals..."
                  />
                </div>

                <div className="zforms__form-grid">
                  <div className="zforms__form-field">
                    <label className="zforms__form-label">Template</label>
                    <select
                      value={createForm.template}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, template: e.target.value }))}
                      className="zforms__form-input"
                    >
                      <option value="">Choose a template...</option>
                      {scopeTemplates.map((template) => (
                        <option key={template.value} value={template.value}>
                          {template.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="zforms__form-field">
                    <label className="zforms__form-label">Timeline</label>
                    <input
                      type="text"
                      value={createForm.timeline}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, timeline: e.target.value }))}
                      className="zforms__form-input"
                      placeholder="e.g., 3 months, 6 weeks"
                    />
                  </div>
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">Objectives</label>
                  <textarea
                    value={createForm.objectives}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, objectives: e.target.value }))}
                    className="zforms__form-textarea"
                    rows={2}
                    placeholder="Project objectives and goals..."
                  />
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">Deliverables</label>
                  <textarea
                    value={createForm.deliverables}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, deliverables: e.target.value }))}
                    className="zforms__form-textarea"
                    rows={2}
                    placeholder="List the specific deliverables..."
                  />
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">Due Date</label>
                  <input
                    type="date"
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="zforms__form-input"
                  />
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">Requirements</label>
                  <textarea
                    value={createForm.requirements}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, requirements: e.target.value }))}
                    className="zforms__form-textarea"
                    rows={2}
                    placeholder="Special requirements or constraints..."
                  />
                </div>

                <div className="zforms__form-actions">
                  <button
                    onClick={handleCreateScope}
                    className="zforms__button zforms__button--primary"
                  >
                    Create Scope
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

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
                <div className="zforms__head">
                  <div className="zforms__cell">Title</div>
                  <div className="zforms__cell">Assigned To</div>
                  <div className="zforms__cell">Status</div>
                  <div className="zforms__cell">Created</div>
                  <div className="zforms__cell">Actions</div>
                </div>
                {dashboardData.pendingReviews.map((scope, index) => (
                  <div key={scope.id} className={`z-row ${index % 2 === 0 ? 'z-row--even' : 'z-row--odd'}`}>
                    <div className="zforms__cell" data-label="Title">
                      <div className="font-medium">{scope.title}</div>
                      <div className="text-sm text-gray-500">{scope.description}</div>
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
                        onClick={() => {
                          setSelectedScope(scope);
                          setShowReviewForm(true);
                        }}
                        className="zforms__button zforms__button--primary mr-2"
                      >
                        Review
                      </button>
                      
                    </div>
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
                <div className="zforms__head">
                  <div className="zforms__cell">Title</div>
                  <div className="zforms__cell">Assigned To</div>
                  <div className="zforms__cell">Status</div>
                  <div className="zforms__cell">Created</div>
                  <div className="zforms__cell">Actions</div>
                </div>
                {dashboardData.allScopes.map((scope, index) => (
                  <div key={scope.id} className={`z-row ${index % 2 === 0 ? 'z-row--even' : 'z-row--odd'}`}>
                    <div className="zforms__cell" data-label="Title">
                      <div className="font-medium">{scope.title}</div>
                      <div className="text-sm text-gray-500">{scope.description}</div>
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
                             {scope.status === 'UNDER_REVIEW' && (
                               <button
                                 onClick={() => {
                                   setSelectedScope(scope);
                                   setShowReviewForm(true);
                                 }}
                                 className="zforms__button zforms__button--primary"
                               >
                                 Review
                               </button>
                             )}
                           </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewForm && selectedScope && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Review Scope</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedScope.title}</p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Review Decision</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="approve"
                      checked={reviewDecision === 'approve'}
                      onChange={(e) => setReviewDecision(e.target.value as 'approve' | 'reject')}
                      className="mr-2"
                    />
                    Approve
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="reject"
                      checked={reviewDecision === 'reject'}
                      onChange={(e) => setReviewDecision(e.target.value as 'approve' | 'reject')}
                      className="mr-2"
                    />
                    Reject
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                  placeholder="Add review comments..."
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewScope}
                  className={`px-4 py-2 text-white rounded ${
                    reviewDecision === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {reviewDecision === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default ScopeManagement;

