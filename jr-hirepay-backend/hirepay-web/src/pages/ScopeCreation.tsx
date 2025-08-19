import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { scopeService, CreateScopeRequest } from '../services/scope';
import { umbrellaAgreementService, FrontOfficeUser } from '../services/umbrellaAgreement';

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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frontOfficeUsers, setFrontOfficeUsers] = useState<FrontOfficeUser[]>([]);
  const [scopeForm, setScopeForm] = useState<ScopeForm>({
    projectTitle: '',
    projectDescription: '',
    deliverables: '',
    timeline: '',
    requirements: '',
    status: 'DRAFT'
  });
  const [assignedToUserId, setAssignedToUserId] = useState<string>('');
  const [template, setTemplate] = useState<string>('');
  const [objectives, setObjectives] = useState<string>('');
  const [constraints, setConstraints] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [isBackOffice, setIsBackOffice] = useState(false);

  // Scope templates
  const scopeTemplates = [
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Design', label: 'Design' },
    { value: 'Data Analysis', label: 'Data Analysis' },
    { value: 'Custom', label: 'Custom' }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        if (currentUser) {
          const isBackOfficeUser = currentUser.roles.includes('BACK_OFFICE') || currentUser.roles.includes('ADMIN');
          setIsBackOffice(isBackOfficeUser);
          
          // Redirect front office users away from scope creation
          if (!isBackOfficeUser) {
            navigate('/dashboard/my-scopes');
            return;
          }
          
          // Load front office users for assignment
          if (isBackOfficeUser) {
            const users = await umbrellaAgreementService.getFrontOfficeUsers();
            setFrontOfficeUsers(users);
          }
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, navigate]);

  const handleFormChange = (field: keyof ScopeForm, value: string) => {
    setScopeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!scopeForm.projectTitle.trim()) {
      setError('Project title is required');
      return false;
    }
    if (!scopeForm.projectDescription.trim()) {
      setError('Project description is required');
      return false;
    }
    if (isBackOffice && !assignedToUserId) {
      setError('Please select a user to assign the scope to');
      return false;
    }
    if (!currentUser?.id) {
      setError('User information not available');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmitForm = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const createRequest: CreateScopeRequest = {
        title: scopeForm.projectTitle,
        description: scopeForm.projectDescription,
        assignedToUserId: isBackOffice ? parseInt(assignedToUserId) : currentUser!.id,
        template: template || undefined,
        objectives: objectives || undefined,
        deliverables: scopeForm.deliverables || undefined,
        timeline: scopeForm.timeline || undefined,
        requirements: scopeForm.requirements || undefined,
        constraints: constraints || undefined,
        dueDate: dueDate ? new Date(dueDate + 'T00:00:00.000Z').toISOString() : undefined
      };

      await scopeService.createScope(createRequest);
      
      // Reset form
      setScopeForm({
        projectTitle: '',
        projectDescription: '',
        deliverables: '',
        timeline: '',
        requirements: '',
        status: 'DRAFT'
      });
      setAssignedToUserId('');
      setTemplate('');
      setObjectives('');
      setConstraints('');
      setDueDate('');
      
      toast.success('Scope created successfully!');
      
      // Navigate based on user role
      if (isBackOffice) {
        navigate('/dashboard/scope-management');
      } else {
        navigate('/dashboard/my-scopes');
      }
    } catch (err) {
      setError('Failed to submit scope form');
      console.error(err);
    } finally {
      setSubmitting(false);
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
                  <label className="zforms__form-label">Project Title *</label>
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

              {isBackOffice && (
                <div className="zforms__form-field">
                  <label className="zforms__form-label">Assign To *</label>
                  <select
                    value={assignedToUserId}
                    onChange={(e) => setAssignedToUserId(e.target.value)}
                    className="zforms__form-input"
                  >
                    <option value="">Choose a user...</option>
                    {frontOfficeUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.designation} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="zforms__form-field">
                <label className="zforms__form-label">Project Description *</label>
                <textarea
                  value={scopeForm.projectDescription}
                  onChange={(e) => handleFormChange('projectDescription', e.target.value)}
                  className="zforms__form-textarea"
                  rows={4}
                  placeholder="Describe the project objectives, goals, and overall scope..."
                />
              </div>

              <div className="zforms__form-grid">
                <div className="zforms__form-field">
                  <label className="zforms__form-label">Template</label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
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
                  <label className="zforms__form-label">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="zforms__form-input"
                  />
                </div>
              </div>

              <div className="zforms__form-field">
                <label className="zforms__form-label">Objectives</label>
                <textarea
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="zforms__form-textarea"
                  rows={2}
                  placeholder="Project objectives and goals..."
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

              <div className="zforms__form-field">
                <label className="zforms__form-label">Constraints</label>
                <textarea
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="zforms__form-textarea"
                  rows={2}
                  placeholder="Project constraints or limitations..."
                />
              </div>

              <div className="zforms__form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/home')}
                  className="zforms__button zforms__button--secondary"
                  style={{ marginRight: '1rem' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitForm}
                  disabled={submitting}
                  className="zforms__button zforms__button--primary"
                >
                  {submitting ? 'Creating Scope...' : 'Submit Scope'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScopeCreation;
