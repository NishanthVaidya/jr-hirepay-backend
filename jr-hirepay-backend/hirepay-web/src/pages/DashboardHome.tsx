import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardHome() {
  const { currentUser } = useAuth();

  return (
    <div className="zforms">
      <div className="zforms__section">
        {/* Header */}
        <div className="zforms__header">
          <div className="zforms__header-content">
            <div>
              <h1 className="zforms__title">Get Hired</h1>
              <p className="zforms__subtitle">Welcome to your hiring dashboard</p>
            </div>
            <div className="zforms__icon">
              <svg className="zforms__icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="zforms__content">
          <div className="zforms__card-grid">
            {/* Document Management Card */}
            {(currentUser?.roles.includes("ADMIN") || currentUser?.roles.includes("BACK_OFFICE")) && (
              <div className="zforms__card">
                <div className="zforms__card-icon zforms__card-icon--primary">
                  <svg className="zforms__card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
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
            )}

            {/* Admin Panel Card */}
            {currentUser?.roles.includes("ADMIN") && (
              <div className="zforms__card">
                <div className="zforms__card-icon zforms__card-icon--success">
                  <svg className="zforms__card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
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
            )}

            {/* My Documents Card - For Front Office Users */}
            {currentUser?.roles.includes("FRONT_OFFICE") && (
              <div className="zforms__card">
                <div className="zforms__card-icon zforms__card-icon--warning">
                  <svg className="zforms__card-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
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
            )}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="zforms__section">
          <div className="zforms__welcome">
            <h2 className="zforms__welcome-title">Welcome, {currentUser?.designation}!</h2>
            <p className="zforms__welcome-text">
              You're logged in as <span className="zforms__welcome-highlight">{currentUser?.email}</span> with the following roles: 
              <span className="zforms__welcome-highlight">
                {currentUser?.roles.join(', ')}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
