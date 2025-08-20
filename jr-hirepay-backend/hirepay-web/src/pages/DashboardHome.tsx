import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardHome() {
  const { currentUser } = useAuth();

  return (
    <div className="zforms">
      <div className="zforms__section">


        {/* Welcome Message */}
        <div className="zforms__content">
          <div className="zforms__welcome">
            <h2 className="zforms__welcome-title" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
              Welcome, {currentUser?.fullName}!
            </h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="zforms__content">
          <div className="zforms__card-grid">
            {/* Document Management Card */}
            {(currentUser?.roles.includes("ADMIN") || currentUser?.roles.includes("BACK_OFFICE")) && (
              <div className="zforms__card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="zforms__card-icon zforms__card-icon--primary" style={{ flexShrink: 0 }}>
                  <svg className="zforms__card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="zforms__card-title">Document Management</h3>
                  <p className="zforms__card-description">
                    Send documents to employees, track signing status, and manage approvals for all document types.
                  </p>
                  <Link
                    to="/dashboard/documents"
                    className="zforms__card-link"
                  >
                    Manage Documents
                    <svg className="zforms__card-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {/* Scope Management Card - For Back Office and Admin Users */}
            {(currentUser?.roles.includes("ADMIN") || currentUser?.roles.includes("BACK_OFFICE")) && (
              <div className="zforms__card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="zforms__card-icon zforms__card-icon--warning" style={{ flexShrink: 0 }}>
                  <svg className="zforms__card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="zforms__card-title">Scope Management</h3>
                  <p className="zforms__card-description">
                    Review and manage all scopes, approve submissions, and track project progress across the organization.
                  </p>
                  <Link
                    to="/dashboard/scope-management"
                    className="zforms__card-link"
                  >
                    Manage Scopes
                    <svg className="zforms__card-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {/* Scope Creation Card - For Back Office and Admin Users */}
            {(currentUser?.roles.includes("ADMIN") || currentUser?.roles.includes("BACK_OFFICE")) && (
              <div className="zforms__card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="zforms__card-icon zforms__card-icon--success" style={{ flexShrink: 0 }}>
                  <svg className="zforms__card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="zforms__card-title">Scope Creation</h3>
                  <p className="zforms__card-description">
                    Create new scopes, assign them to front office users, and set project requirements and timelines.
                  </p>
                  <Link
                    to="/dashboard/scope-creation"
                    className="zforms__card-link"
                  >
                    Create New Scope
                    <svg className="zforms__card-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {/* Admin Panel Card */}
            {currentUser?.roles.includes("ADMIN") && (
              <div className="zforms__card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="zforms__card-icon zforms__card-icon--success" style={{ flexShrink: 0 }}>
                  <svg className="zforms__card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="zforms__card-title">Admin Panel</h3>
                  <p className="zforms__card-description">
                    Create and manage users, assign roles, and configure system settings.
                  </p>
                  <Link
                    to="/dashboard/admin"
                    className="zforms__card-link"
                  >
                    Access Admin Panel
                    <svg className="zforms__card-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {/* My Documents Card - For Front Office Users */}
            {currentUser?.roles.includes("FRONT_OFFICE") && (
              <div className="zforms__card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="zforms__card-icon zforms__card-icon--warning" style={{ flexShrink: 0 }}>
                  <svg className="zforms__card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="zforms__card-title">My Documents</h3>
                  <p className="zforms__card-description">
                    View documents sent to you, sign agreements, and track your document status.
                  </p>
                  <Link
                    to="/dashboard/documents"
                    className="zforms__card-link"
                  >
                    View My Documents
                    <svg className="zforms__card-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {/* My Scopes Card - For Front Office Users */}
            {currentUser?.roles.includes("FRONT_OFFICE") && (
              <div className="zforms__card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="zforms__card-icon zforms__card-icon--primary" style={{ flexShrink: 0 }}>
                  <svg className="zforms__card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="zforms__card-title">My Scopes</h3>
                  <p className="zforms__card-description">
                    View and manage your assigned scopes, track progress, and submit work for review.
                  </p>
                  <Link
                    to="/dashboard/my-scopes"
                    className="zforms__card-link"
                  >
                    View My Scopes
                    <svg className="zforms__card-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>


      </div>
    </div>
  );
}
