import React, { useState, useEffect, useCallback } from 'react';
import { umbrellaAgreementService, FrontOfficeUser, UmbrellaAgreement } from '../services/umbrellaAgreement';
import { useAuth } from '../contexts/AuthContext';
import ApprovedDocumentsBrowser from '../components/ApprovedDocumentsBrowser';
import { transformToApprovedDocumentsBrowser, isFormSubmission } from '../utils/documentTransformers';

const DocumentManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [frontOfficeUsers, setFrontOfficeUsers] = useState<FrontOfficeUser[]>([]);
  const [myDocuments, setMyDocuments] = useState<UmbrellaAgreement[]>([]);
  const [pendingReviews, setPendingReviews] = useState<UmbrellaAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('UMBRELLA_AGREEMENT');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedSignId, setExpandedSignId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [hasReviewedConfirm, setHasReviewedConfirm] = useState(false);
  const [signNotes, setSignNotes] = useState('');
  const [signedFile, setSignedFile] = useState<File | null>(null);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject'>('approve');

  const isBackOffice = currentUser?.roles.includes('BACK_OFFICE') || currentUser?.roles.includes('ADMIN');
  const isAdmin = currentUser?.roles.includes('ADMIN');

  // Document type options
  const documentTypes = [
    { value: 'UMBRELLA_AGREEMENT', label: 'Umbrella Agreement' },
    { value: 'TAX_FORM_W9', label: 'Tax Form W-9' },
    { value: 'TAX_FORM_W8BEN', label: 'Tax Form W-8BEN' },
    { value: 'PAYMENT_AUTH_FORM', label: 'Payment Authorization Form' },
    { value: 'TASK_ORDER', label: 'Task Order' },
    { value: 'AGREEMENT_MODIFICATION', label: 'Agreement Modification' },
    { value: 'TASK_ORDER_MODIFICATION', label: 'Task Order Modification' },
    { value: 'INVOICE', label: 'Invoice' },
    { value: 'DELIVERABLES_PROOF', label: 'Deliverables Proof' }
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [users, documents] = await Promise.all([
        umbrellaAgreementService.getFrontOfficeUsers(),
        umbrellaAgreementService.getMyAgreements()
      ]);
      
      setFrontOfficeUsers(users);
      setMyDocuments(documents);

      if (isBackOffice) {
        const reviews = await umbrellaAgreementService.getPendingReviewAgreements();
        setPendingReviews(reviews);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isBackOffice]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF or Word document');
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSendDocument = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }
    if (!selectedFile) {
      setError('Please select a document to upload');
      return;
    }

    try {
      await umbrellaAgreementService.sendAgreement({
        frontOfficeUserId: selectedUser,
        notes: notes || undefined,
        document: selectedFile,
        documentType: selectedDocumentType
      });
      
      setSelectedUser('');
      setSelectedDocumentType('UMBRELLA_AGREEMENT');
      setNotes('');
      setSelectedFile(null);
      setError(null);
      loadData(); // Refresh data
      alert('Document sent successfully!');
    } catch (err) {
      setError('Failed to send document');
      console.error(err);
    }
  };

  // removed legacy modal handler

  const toggleSignSection = (documentId: string) => {
    if (expandedSignId === documentId) {
      setExpandedSignId(null);
      setSignerName('');
      setHasReviewedConfirm(false);
      setSignNotes('');
    } else {
      setExpandedSignId(documentId);
      setSignerName('');
      setHasReviewedConfirm(false);
      setSignNotes('');
    }
  };

  const handleInlineSign = async (document: UmbrellaAgreement) => {
    try {
      await umbrellaAgreementService.signAgreement({
        documentId: document.documentId,
        signerName,
        hasReviewed: hasReviewedConfirm,
        notes: signNotes || undefined,
        signedDocument: signedFile || undefined
      });
      setExpandedSignId(null);
      setSignerName('');
      setHasReviewedConfirm(false);
      setSignNotes('');
      setSignedFile(null);
      loadData();
      alert('Document signed successfully!');
    } catch (err) {
      setError('Failed to sign document');
      console.error(err);
    }
  };



  const handleSaveToGoogleDrive = async (documentId: string, folderName: string) => {
    try {
      await umbrellaAgreementService.saveToGoogleDrive({
        documentId,
        folderName
      });
      
      loadData();
      alert('Document saved to Google Drive successfully!');
    } catch (err) {
      setError('Failed to save to Google Drive');
      console.error(err);
    }
  };

  const handleDownloadDocument = async (documentId: string, documentName: string) => {
    try {
      const response = await umbrellaAgreementService.downloadDocument(documentId);
      const blob = new Blob([response.blob], { type: response.contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download document');
      console.error(err);
    }
  };



  const getStatusBadge = (status: string, documentType?: string) => {
    // For front office users, show "RECEIVED" instead of "SENT"
    let displayStatus = (!isBackOffice && status === 'SENT') ? 'RECEIVED' : status;
    
    // Only apply form-specific status names for back office users
    if (isBackOffice && documentType && isFormSubmission(documentType)) {
      if (status === 'SENT') displayStatus = 'FORM_SENT';
      if (status === 'SUBMITTED') displayStatus = 'FORM_SUBMITTED';
      if (status === 'APPROVED') displayStatus = 'FORM_APPROVED';
      if (status === 'REJECTED') displayStatus = 'FORM_REJECTED';
    }
    
    const statusClasses = {
      'SENT': 'zforms__badge--sent',
      'RECEIVED': 'zforms__badge--sent',
      'FORM_SENT': 'zforms__badge--sent',
      'SIGNED': 'zforms__badge--signed',
      'APPROVED': 'zforms__badge--approved',
      'FORM_APPROVED': 'zforms__badge--approved',
      'REJECTED': 'zforms__badge--rejected',
      'FORM_REJECTED': 'zforms__badge--rejected',
      'DRAFT': 'zforms__badge--draft',
      'SUBMITTED': 'zforms__badge--submitted',
      'FORM_SUBMITTED': 'zforms__badge--submitted',
      'UNDER_REVIEW': 'zforms__badge--review',
      'PAID': 'zforms__badge--paid',
      'COMPLETED': 'zforms__badge--completed',
      'OVERDUE': 'zforms__badge--overdue',
      'ARCHIVED': 'zforms__badge--archived',
      'EXPIRED': 'zforms__badge--expired'
    };
    
    return (
      <span className={`zforms__badge--status ${statusClasses[displayStatus as keyof typeof statusClasses] || 'zforms__badge--status'}`}>
        {displayStatus}
      </span>
    );
  };

  const getDocumentTypeLabel = (docReference: string) => {
    const docType = documentTypes.find(type => type.value === docReference);
    return docType ? docType.label : docReference;
  };

  const toggleReviewSection = (documentId: string) => {
    if (expandedReviewId === documentId) {
      setExpandedReviewId(null);
      setReviewNotes('');
      setReviewDecision('approve');
    } else {
      setExpandedReviewId(documentId);
      setReviewNotes('');
      setReviewDecision('approve');
    }
  };

  const handleInlineReview = async (document: UmbrellaAgreement) => {
    try {
      await umbrellaAgreementService.reviewAgreement({
        documentId: document.documentId,
        approved: reviewDecision === 'approve',
        notes: reviewNotes || undefined
      });
      
      setExpandedReviewId(null);
      setReviewNotes('');
      setReviewDecision('approve');
      loadData();
      alert(`Document ${reviewDecision === 'approve' ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      setError('Failed to review document');
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="zform-dashboard-title">Document Management</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="zform-error-message mb-10">
            {error}
          </div>
        )}

        {/* Back Office Section - Send Documents */}
        {isBackOffice && (
          <div className="zforms">
            <div className="zforms__section">
              <div className="zforms__header">
                <div className="zforms__title">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Send Document
                </div>
                <span className="zforms__badge">
                  {frontOfficeUsers.length} users
                </span>
              </div>
              
              {frontOfficeUsers.length === 0 ? (
                <div className="zforms__empty">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No front office users found.</p>
                  {isAdmin && (
                    <p className="text-sm">You can create new users in the Admin panel.</p>
                  )}
                </div>
              ) : (
                <div className="zforms__content">
                  <div className="zforms__form-grid">
                    <div className="zforms__form-field">
                      <label className="zforms__form-label">
                        Select Front Office User
                      </label>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
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

                    <div className="zforms__form-field">
                      <label className="zforms__form-label">
                        Document Type
                      </label>
                      <select
                        value={selectedDocumentType}
                        onChange={(e) => setSelectedDocumentType(e.target.value)}
                        className="zforms__form-input"
                      >
                        {documentTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="zforms__form-field">
                    <label className="zforms__form-label">
                      Attach Document
                    </label>
                    <div className="zforms__upload-area">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        className="zforms__file-input"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="zforms__upload-label">
                        <div className="zforms__upload-icon">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <div className="zforms__upload-text">
                          <span className="zforms__upload-link">Click to upload</span> or drag and drop
                        </div>
                        <div className="zforms__upload-hint">
                          PDF, DOC, DOCX up to 5MB
                        </div>
                      </label>
                    </div>
                    {selectedFile && (
                      <div className="zforms__file-preview">
                        <div className="zforms__file-info">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="zforms__file-name">{selectedFile.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="zforms__form-field">
                    <label className="zforms__form-label">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="zforms__form-textarea"
                      placeholder="Add any notes about this document..."
                    />
                  </div>

                  <div className="zforms__form-actions">
                    <button
                      onClick={handleSendDocument}
                      disabled={!selectedUser || !selectedFile}
                      className="zforms__button zforms__button--primary"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Reviews Section - Back Office Only */}
        {isBackOffice && pendingReviews.length > 0 && (
          <div className="zforms">
            <div className="zforms__section">
              <div className="zforms__header">
                <div className="zforms__title">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending Reviews
                </div>
                <span className="zforms__badge">
                  {pendingReviews.length} pending
                </span>
              </div>
              
              <div className="zforms__table">
                <div className="zforms__head">
                  <div className="zforms__cell">Document Type</div>
                  <div className="zforms__cell">User</div>
                  <div className="zforms__cell">Status</div>
                  <div className="zforms__cell">Signed At</div>
                  <div className="zforms__cell">Actions</div>
                </div>
                {pendingReviews.map((document, index) => (
                  <React.Fragment key={document.documentId}>
                    <div className={`z-row ${index % 2 === 0 ? 'z-row--even' : 'z-row--odd'}`}>
                      <div className="zforms__cell zforms__file" data-label="Document Type">
                        <div className="z-icon">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <button
                          className="zforms__file-content zforms__file-title"
                          onClick={() => handleDownloadDocument(document.documentId, document.documentName || 'document.pdf')}
                          title="Download document"
                          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                        >
                          {getDocumentTypeLabel(document.documentType || 'UMBRELLA_AGREEMENT')}
                        </button>
                      </div>
                      <div className="zforms__cell zforms__user" data-label="User">
                        <div className="zforms__user-name" title={document.frontOfficeUserName}>
                          {document.frontOfficeUserName}
                        </div>
                        <div className="zforms__user-email" title={document.frontOfficeUserEmail}>
                          {document.frontOfficeUserEmail}
                        </div>
                      </div>
                      <div className="zforms__cell zforms__status" data-label="Status">
                        {getStatusBadge(document.status)}
                      </div>
                      <div className="zforms__cell zforms__date" data-label="Signed At">
                        {document.signedAt ? new Date(document.signedAt).toLocaleDateString() : '-'}
                      </div>
                      <div className="zforms__cell zforms__actions" data-label="Actions">
                        <button
                          onClick={() => toggleReviewSection(document.documentId)}
                          className="zforms__button zforms__button--primary"
                        >
                          {expandedReviewId === document.documentId ? 'Hide Review' : 'Review'}
                        </button>


                      </div>
                    </div>
                    
                    {/* Collapsible Review Section */}
                    {expandedReviewId === document.documentId && (
                      <div className="z-row z-row--review-expanded">
                        <div className="zforms__cell zforms__review-section" style={{ gridColumn: '1 / -1' }}>
                          <div className="zforms__review-content">
                            <h4 className="zforms__review-title">Review Signed Document</h4>
                            
                            <div className="zforms__review-info">
                              <div className="zforms__review-info-item">
                                <strong>Signed by:</strong> {document.signerName}
                              </div>
                              <div className="zforms__review-info-item">
                                <strong>Signed at:</strong> {document.signedAt ? new Date(document.signedAt).toLocaleString() : 'N/A'}
                              </div>
                            </div>
                            
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              handleInlineReview(document);
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
                                </div>
                              </div>

                              <div className="zforms__review-notes">
                                <label className="zforms__review-label">Review Notes (Optional)</label>
                                <textarea
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  rows={3}
                                  className="zforms__review-textarea"
                                  placeholder="Add review comments..."
                                />
                              </div>

                              <div className="zforms__review-actions">
                                <button
                                  type="button"
                                  onClick={() => toggleReviewSection(document.documentId)}
                                  className="zforms__button zforms__button--secondary"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className={`zforms__button ${
                                    reviewDecision === 'approve' 
                                      ? 'zforms__button--success' 
                                      : 'zforms__button--danger'
                                  }`}
                                >
                                  {reviewDecision === 'approve' ? 'Approve' : 'Reject'} Document
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents Section - role specific */}
        {isBackOffice ? (
          // Back office: show Approved Documents Browser
          <div className="zforms">
            <div className="zforms__section">
              <div className="zforms__header">
                <div className="zforms__title">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Approved Documents
                </div>
                <span className="zforms__badge">
                  {transformToApprovedDocumentsBrowser(myDocuments, frontOfficeUsers).length} users
                </span>
              </div>
              
              <p className="zforms__lead">
                Browse approved documents organized by user. Click on a user row to expand and view their signed documents.
                Use the search to filter users by name.
              </p>
              
              <ApprovedDocumentsBrowser
                users={transformToApprovedDocumentsBrowser(myDocuments, frontOfficeUsers)}
                pageSize={20}
                onViewDocument={(doc, user) => {
                  if (doc.viewUrl) {
                    window.open(doc.viewUrl, '_blank');
                  }
                }}
                onDownloadDocument={(doc, user) => {
                  // Use the same download function as front office
                  handleDownloadDocument(doc.id, doc.title);
                }}
              />
            </div>
          </div>
        ) : (
          // Front office: show My Documents list with actions and comments
          <div className="zforms">
            <div className="zforms__section">
              <div className="zforms__header">
                <div className="zforms__title">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Documents
                </div>
                <span className="zforms__badge">
                  {myDocuments.filter(d => d.frontOfficeUserEmail === currentUser?.email).length}
                </span>
              </div>

              <div className="zforms__table">
                <div className="zforms__head" data-columns="5">
                  <div className="zforms__cell">Document Type</div>
                  <div className="zforms__cell">From</div>
                  <div className="zforms__cell">Status</div>
                  <div className="zforms__cell">Updated On</div>
                  <div className="zforms__cell">Actions</div>
                </div>
                {myDocuments
                  .filter(doc => doc.frontOfficeUserEmail === currentUser?.email)
                  .map((document, index) => (
                  <div key={document.documentId} className={`z-row ${index % 2 === 0 ? 'z-row--even' : 'z-row--odd'}`} data-columns="5">
                    <div className="zforms__cell zforms__file" data-label="Document Type">
                      <div className="z-icon">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <button
                        className="zforms__file-content zforms__file-title"
                        onClick={() => handleDownloadDocument(document.documentId, document.documentName || 'document.pdf')}
                        title="Download document"
                        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                      >
                        {getDocumentTypeLabel(document.documentType || 'UMBRELLA_AGREEMENT')}
                      </button>
                    </div>
                    <div className="zforms__cell zforms__user" data-label="From">
                      <div className="zforms__user-name" title={document.sentBy}>
                        {document.sentBy}
                      </div>
                    </div>
                    <div className="zforms__cell zforms__status" data-label="Status">
                      {getStatusBadge(document.status, document.documentType)}
                    </div>
                    <div className="zforms__cell zforms__date" data-label="Updated On">
                      {(document.signedAt || document.sentAt) ? new Date(document.signedAt || document.sentAt).toLocaleDateString() : '-'}
                    </div>

                     <div className="zforms__cell zforms__actions" data-label="Actions">
                       {/* Actions column - buttons for document actions */}
                       {document.status === 'SENT' && (
                         <>
                           {isFormSubmission(document.documentType || 'UMBRELLA_AGREEMENT') ? (
                             <button
                               onClick={() => toggleSignSection(document.documentId)}
                               className="zforms__button zforms__button--primary"
                             >
                               {expandedSignId === document.documentId ? 'Hide Form' : 'Fill & Submit'}
                             </button>
                           ) : (
                             <button
                               onClick={() => toggleSignSection(document.documentId)}
                               className="zforms__button zforms__button--primary"
                             >
                               {expandedSignId === document.documentId ? 'Hide Sign' : 'Sign'}
                             </button>
                           )}
                         </>
                       )}
                     </div>
                     {/* Collapsible Sign Section */}
                     {expandedSignId === document.documentId && (
                       <div className="z-row z-row--review-expanded">
                         <div className="zforms__cell zforms__review-section" style={{ gridColumn: '1 / -1' }}>
                           <div className="sign-grid">
                             <form onSubmit={(e) => { e.preventDefault(); handleInlineSign(document); }} className="sign-grid__form">
                               <div className="sign-card">
                                 {isFormSubmission(document.documentType || 'UMBRELLA_AGREEMENT') ? (
                                   <>
                                     <label className="sign-label">Your Full Name *</label>
                                     <input
                                       type="text"
                                       value={signerName}
                                       onChange={(e) => setSignerName(e.target.value)}
                                       className="sign-input"
                                       placeholder="Enter your full name"
                                       required
                                     />
                                     <label className="sign-label">Form Notes (Optional)</label>
                                     <textarea
                                       value={signNotes}
                                       onChange={(e) => setSignNotes(e.target.value)}
                                       rows={3}
                                       className="sign-textarea"
                                       placeholder="Any additional information about the form..."
                                     />
                                   </>
                                 ) : (
                                   <>
                                     <label className="sign-label">Your Full Name *</label>
                                     <input
                                       type="text"
                                       value={signerName}
                                       onChange={(e) => setSignerName(e.target.value)}
                                       className="sign-input"
                                       placeholder="Enter your full name"
                                       required
                                     />
                                   </>
                                 )}
                               </div>
                               <div className="sign-col">
                                 <label className="sign-label">Confirmation</label>
                                 <label className="sign-check">
                                   <input
                                     type="checkbox"
                                     checked={hasReviewedConfirm}
                                     onChange={(e) => setHasReviewedConfirm(e.target.checked)}
                                     className="sign-checkbox"
                                   />
                                   <span>
                                     {isFormSubmission(document.documentType || 'UMBRELLA_AGREEMENT') 
                                       ? 'I have completed the form accurately and truthfully'
                                       : 'I have reviewed and understood the document'
                                     }
                                   </span>
                                 </label>
                                 <label className="sign-label">
                                   {isFormSubmission(document.documentType || 'UMBRELLA_AGREEMENT')
                                     ? 'Attach completed form file *'
                                     : 'Attach signed file (optional)'
                                   }
                                 </label>
                                 <input
                                   type="file"
                                   accept=".pdf,.doc,.docx"
                                   onChange={(e) => setSignedFile(e.target.files?.[0] || null)}
                                   className="sign-input"
                                   required={isFormSubmission(document.documentType || 'UMBRELLA_AGREEMENT')}
                                 />
                               </div>
                               <div className="sign-col">
                                 <label className="sign-label">Additional Notes (Optional)</label>
                                 <textarea
                                   value={signNotes}
                                   onChange={(e) => setSignNotes(e.target.value)}
                                   rows={3}
                                   className="sign-textarea"
                                   placeholder="Any additional comments..."
                                 />
                               </div>
                               <div className="sign-actions">
                                 <button
                                   type="button"
                                   onClick={() => toggleSignSection(document.documentId)}
                                   className="zforms__button zforms__button--secondary"
                                 >
                                   Cancel
                                 </button>
                                 <button
                                   type="submit"
                                   className="zforms__button zforms__button--success"
                                   disabled={!signerName || !hasReviewedConfirm || (isFormSubmission(document.documentType || 'UMBRELLA_AGREEMENT') && !signedFile)}
                                 >
                                   {isFormSubmission(document.documentType || 'UMBRELLA_AGREEMENT') ? 'Submit Form' : 'Send Document'}
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

      {/* Inline sign section replaces modal for front office */}
    </div>
  );
};


export default DocumentManagement;
