import React, { useState, useEffect, useCallback } from 'react';
import { umbrellaAgreementService, FrontOfficeUser, UmbrellaAgreement } from '../services/umbrellaAgreement';
import { useAuth } from '../contexts/AuthContext';

const UmbrellaAgreementManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [frontOfficeUsers, setFrontOfficeUsers] = useState<FrontOfficeUser[]>([]);
  const [myAgreements, setMyAgreements] = useState<UmbrellaAgreement[]>([]);
  const [pendingReviews, setPendingReviews] = useState<UmbrellaAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<UmbrellaAgreement | null>(null);

  const isBackOffice = currentUser?.roles.includes('BACK_OFFICE') || currentUser?.roles.includes('ADMIN');
  const isAdmin = currentUser?.roles.includes('ADMIN');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [users, agreements] = await Promise.all([
        umbrellaAgreementService.getFrontOfficeUsers(),
        umbrellaAgreementService.getMyAgreements()
      ]);
      
      setFrontOfficeUsers(users);
      setMyAgreements(agreements);

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

  const handleSendAgreement = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    try {
      await umbrellaAgreementService.sendAgreement({
        frontOfficeUserId: selectedUser,
        notes: notes || undefined
      });
      
      setSelectedUser('');
      setNotes('');
      setError(null);
      loadData(); // Refresh data
      alert('Umbrella agreement sent successfully!');
    } catch (err) {
      setError('Failed to send agreement');
      console.error(err);
    }
  };

  const handleSignAgreement = async (signerName: string, hasReviewed: boolean, signNotes?: string) => {
    if (!selectedAgreement) return;

    try {
      await umbrellaAgreementService.signAgreement({
        documentId: selectedAgreement.documentId,
        signerName,
        hasReviewed,
        notes: signNotes
      });
      
      setShowSignModal(false);
      setSelectedAgreement(null);
      loadData();
      alert('Agreement signed successfully!');
    } catch (err) {
      setError('Failed to sign agreement');
      console.error(err);
    }
  };

  const handleReviewAgreement = async (approved: boolean, reviewNotes?: string) => {
    if (!selectedAgreement) return;

    try {
      await umbrellaAgreementService.reviewAgreement({
        documentId: selectedAgreement.documentId,
        approved,
        notes: reviewNotes
      });
      
      setShowReviewModal(false);
      setSelectedAgreement(null);
      loadData();
      alert(`Agreement ${approved ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      setError('Failed to review agreement');
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
      alert('Agreement saved to Google Drive successfully!');
    } catch (err) {
      setError('Failed to save to Google Drive');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'SENT': 'bg-blue-100 text-blue-800',
      'SIGNED': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'DRAFT': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Umbrella Agreement Management</h1>
          <p className="mt-2 text-gray-600">
            Welcome, {currentUser?.email} ({currentUser?.designation})
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Back Office Section - Send Agreements */}
        {isBackOffice && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Umbrella Agreement</h2>
            
            {frontOfficeUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No front office users found.</p>
                {isAdmin && (
                  <p className="text-sm text-gray-400">
                    You can create new users in the Admin panel.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Front Office User
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a user...</option>
                    {frontOfficeUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.designation} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about this agreement..."
                  />
                </div>

                <button
                  onClick={handleSendAgreement}
                  disabled={!selectedUser}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Send Umbrella Agreement
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pending Reviews Section - Back Office Only */}
        {isBackOffice && pendingReviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Reviews</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signed At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingReviews.map((agreement) => (
                    <tr key={agreement.documentId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {agreement.frontOfficeUserName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {agreement.frontOfficeUserEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(agreement.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agreement.signedAt ? new Date(agreement.signedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedAgreement(agreement);
                            setShowReviewModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* My Agreements Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Agreements</h2>
          
          {myAgreements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No agreements found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myAgreements.map((agreement) => (
                    <tr key={agreement.documentId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {agreement.frontOfficeUserName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {agreement.frontOfficeUserEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(agreement.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(agreement.sentAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {agreement.status === 'SENT' && !isBackOffice && (
                          <button
                            onClick={() => {
                              setSelectedAgreement(agreement);
                              setShowSignModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Sign
                          </button>
                        )}
                        {agreement.status === 'APPROVED' && isBackOffice && (
                          <button
                            onClick={() => handleSaveToGoogleDrive(agreement.documentId, 'Umbrella Agreements')}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Save to Drive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sign Agreement Modal */}
      {showSignModal && selectedAgreement && (
        <SignAgreementModal
          agreement={selectedAgreement}
          onSign={handleSignAgreement}
          onClose={() => {
            setShowSignModal(false);
            setSelectedAgreement(null);
          }}
        />
      )}

      {/* Review Agreement Modal */}
      {showReviewModal && selectedAgreement && (
        <ReviewAgreementModal
          agreement={selectedAgreement}
          onReview={handleReviewAgreement}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedAgreement(null);
          }}
        />
      )}
    </div>
  );
};

// Sign Agreement Modal Component
interface SignAgreementModalProps {
  agreement: UmbrellaAgreement;
  onSign: (signerName: string, hasReviewed: boolean, notes?: string) => void;
  onClose: () => void;
}

const SignAgreementModal: React.FC<SignAgreementModalProps> = ({ agreement, onSign, onClose }) => {
  const [signerName, setSignerName] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!hasReviewed) {
      alert('Please confirm that you have reviewed the agreement');
      return;
    }
    onSign(signerName, hasReviewed, notes || undefined);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sign Umbrella Agreement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Full Name *
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasReviewed"
                checked={hasReviewed}
                onChange={(e) => setHasReviewed(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="hasReviewed" className="ml-2 block text-sm text-gray-900">
                I confirm that I have reviewed and understood the umbrella agreement *
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional comments..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Sign Agreement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Review Agreement Modal Component
interface ReviewAgreementModalProps {
  agreement: UmbrellaAgreement;
  onReview: (approved: boolean, notes?: string) => void;
  onClose: () => void;
}

const ReviewAgreementModal: React.FC<ReviewAgreementModalProps> = ({ agreement, onReview, onClose }) => {
  const [approved, setApproved] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReview(approved, notes || undefined);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Review Signed Agreement</h3>
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Signed by:</strong> {agreement.signerName}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Signed at:</strong> {agreement.signedAt ? new Date(agreement.signedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Decision
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="approve"
                    checked={approved}
                    onChange={() => setApproved(true)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Approve</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reject"
                    checked={!approved}
                    onChange={() => setApproved(false)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-900">Reject</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add review comments..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${
                  approved 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {approved ? 'Approve' : 'Reject'} Agreement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UmbrellaAgreementManagement;
