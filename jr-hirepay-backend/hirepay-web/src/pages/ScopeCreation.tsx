import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';



interface ScopeForm {
  projectTitle: string;
  projectDescription: string;
  deliverables: string;
  timeline: string;
  requirements: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
}

const ScopeCreation: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scopeForm, setScopeForm] = useState<ScopeForm>({
    projectTitle: '',
    projectDescription: '',
    deliverables: '',
    timeline: '',
    requirements: '',
    status: 'DRAFT'
  });
  const [isBackOffice, setIsBackOffice] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsBackOffice(currentUser.roles.includes('BACK_OFFICE') || currentUser.roles.includes('ADMIN'));
      setLoading(false);
    }
  }, [currentUser]);

  const handleFormChange = (field: keyof ScopeForm, value: string) => {
    setScopeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitForm = async () => {
    try {
      // TODO: Implement form submission
      console.log('Submitting scope form:', scopeForm);
      alert('Scope form submitted successfully!');
    } catch (err) {
      setError('Failed to submit scope form');
      console.error(err);
    }
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
            <h1 className="zform-dashboard-title">Scope Creation</h1>
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

        {/* Main Content */}
        <div className="zforms">
            <div className="zforms__section">
              <div className="zforms__header">
                <div className="zforms__title">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Scope Form
                </div>
                <span className="zforms__badge">
                  {scopeForm.status}
                </span>
              </div>

              <div className="zforms__content">
                <div className="zforms__form-grid">
                  <div className="zforms__form-field">
                    <label className="zforms__form-label">Project Title</label>
                    <input
                      type="text"
                      value={scopeForm.projectTitle}
                      onChange={(e) => handleFormChange('projectTitle', e.target.value)}
                      className="zforms__form-input"
                      placeholder="Enter project title"
                    />
                  </div>

                  <div className="zforms__form-field">
                    <label className="zforms__form-label">Timeline</label>
                    <input
                      type="text"
                      value={scopeForm.timeline}
                      onChange={(e) => handleFormChange('timeline', e.target.value)}
                      className="zforms__form-input"
                      placeholder="e.g., 3 months, 6 weeks"
                    />
                  </div>
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">Project Description</label>
                  <textarea
                    value={scopeForm.projectDescription}
                    onChange={(e) => handleFormChange('projectDescription', e.target.value)}
                    className="zforms__form-textarea"
                    rows={4}
                    placeholder="Describe the project objectives, goals, and overall scope..."
                  />
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">Deliverables</label>
                  <textarea
                    value={scopeForm.deliverables}
                    onChange={(e) => handleFormChange('deliverables', e.target.value)}
                    className="zforms__form-textarea"
                    rows={3}
                    placeholder="List the specific deliverables and outputs..."
                  />
                </div>

                <div className="zforms__form-field">
                  <label className="zforms__form-label">Requirements</label>
                  <input
                    type="text"
                    value={scopeForm.requirements}
                    onChange={(e) => handleFormChange('requirements', e.target.value)}
                    className="zforms__form-input"
                    placeholder="Special requirements or constraints"
                  />
                </div>

                <div className="zforms__form-actions">
                  <button
                    onClick={handleSubmitForm}
                    className="zforms__button zforms__button--primary"
                  >
                    Submit Scope
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeCreation;
