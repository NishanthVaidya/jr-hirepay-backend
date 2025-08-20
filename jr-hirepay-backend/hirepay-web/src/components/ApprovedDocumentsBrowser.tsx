import React, { useState, useMemo, useDeferredValue } from 'react';
import styles from './ApprovedDocumentsBrowser.module.css';
import { DocStatus } from '../utils/documentTransformers';

type DocumentItem = {
  id: string;
  title: string;          // e.g., "Umbrella Agreement"
  type: string;           // e.g., "Agreement"
  status: DocStatus;      // approved docs are SIGNED
  updatedAt: string;      // ISO date
  downloadUrl?: string;
  viewUrl?: string;
  notes?: string;
};

type UserItem = {
  id: string;
  name: string;           // used for sorting & search
  email?: string;
  documents: DocumentItem[];
};

interface ApprovedDocumentsBrowserProps {
  users: UserItem[];                 // All users that have at least 1 approved doc
  pageSize?: number;                 // default 20
  onViewDocument?: (doc: DocumentItem, user: UserItem) => void;
  onDownloadDocument?: (doc: DocumentItem, user: UserItem) => void;
}

const ApprovedDocumentsBrowser: React.FC<ApprovedDocumentsBrowserProps> = ({
  users,
  pageSize = 20,
  onViewDocument,
  onDownloadDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(deferredSearchTerm.toLowerCase())
    );
    
    // Sort alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [users, deferredSearchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchTerm]);

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleViewDocument = (doc: DocumentItem, user: UserItem) => {
    if (onViewDocument) {
      onViewDocument(doc, user);
    } else if (doc.viewUrl) {
      window.open(doc.viewUrl, '_blank');
    }
  };

  const handleDownloadDocument = (doc: DocumentItem, user: UserItem) => {
    if (onDownloadDocument) {
      onDownloadDocument(doc, user);
    } else if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank');
    }
  };

  const handleSaveToGoogleDrive = (doc: DocumentItem, user: UserItem) => {
    // Dummy URL for now - will be connected to Google Drive later
    const dummyGoogleDriveUrl = `https://drive.google.com/drive/folders/dummy-folder-id?usp=sharing`;
    console.log(`Saving document "${doc.title}" to Google Drive for user "${user.name}"`);
    console.log(`Google Drive URL: ${dummyGoogleDriveUrl}`);
    alert(`Document "${doc.title}" will be saved to Google Drive. (Dummy URL: ${dummyGoogleDriveUrl})`);
  };

  const getStatusBadge = (status: DocStatus) => {
    const statusClass = status === 'SIGNED' ? styles.statusSigned : 
                       status === 'APPROVED' ? styles.statusSigned : // Use same style as SIGNED for APPROVED
                       status === 'RECEIVED' ? styles.statusReceived :
                       status === 'PENDING' ? styles.statusPending :
                       styles.statusRejected;
    
    return (
      <span className={`${styles.statusBadge} ${statusClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      {/* Search */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          aria-label="Search users"
        />
      </div>

      {/* Users List */}
      {paginatedUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={styles.emptyText}>
            {deferredSearchTerm ? 'No users match your search.' : 'No approved documents found.'}
          </p>
        </div>
      ) : (
        <div className={styles.usersList}>
          {paginatedUsers.map((user) => {
            const isExpanded = expandedUsers.has(user.id);
            const approvedDocs = user.documents.filter(doc => doc.status === 'SIGNED' || doc.status === 'APPROVED');
            
            return (
              <div key={user.id} className={styles.userRow}>
                <button
                  className={styles.userToggle}
                  onClick={() => toggleUserExpansion(user.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`user-docs-${user.id}`}
                >
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.name}</span>
                    {user.email && (
                      <span className={styles.userEmail}>{user.email}</span>
                    )}
                  </div>
                  <div className={styles.userMeta}>
                    <span className={styles.docCount}>
                      {approvedDocs.length} approved document{approvedDocs.length !== 1 ? 's' : ''}
                    </span>
                    <svg 
                      className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div 
                    id={`user-docs-${user.id}`}
                    className={styles.documentsRegion}
                    role="region"
                    aria-labelledby={`user-${user.id}`}
                  >
                    {approvedDocs.length === 0 ? (
                      <div className={styles.noDocsMessage}>
                        No approved documents.
                      </div>
                    ) : (
                      <div className={styles.documentsTable}>
                        <div className={styles.documentsHeader}>
                          <div className={styles.docHeaderCell}>Document Title</div>
                          <div className={styles.docHeaderCell}>Type</div>
                          <div className={styles.docHeaderCell}>Status</div>
                          <div className={styles.docHeaderCell}>Updated On</div>
                          <div className={styles.docHeaderCell}>Save to Drive</div>
                        </div>
                        {approvedDocs.map((doc) => (
                          <div key={doc.id} className={styles.documentRow}>
                            <div className={styles.docCell} title={doc.title}>
                              <button
                                onClick={() => handleDownloadDocument(doc, user)}
                                className={styles.docTitleButton}
                                title="Download document"
                              >
                                {doc.title}
                              </button>
                            </div>
                            <div className={styles.docCell}>
                              <span className={styles.docType}>{doc.type}</span>
                            </div>
                            <div className={styles.docCell}>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className={styles.docCell}>
                              <span className={styles.docDate}>
                                {new Date(doc.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className={styles.docCell}>
                              <button
                                onClick={() => handleSaveToGoogleDrive(doc, user)}
                                className={styles.actionButton}
                                title="Save to Google Drive"
                              >
                                <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                                Save to Drive
                              </button>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`${styles.pageButton} ${currentPage === page ? styles.currentPage : ''}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ApprovedDocumentsBrowser;
