import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardHome() {
  const { currentUser } = useAuth();

  return (
    <div className="zform-dashboard">
      <div className="zform-dashboard-container">
        {/* Header */}
        <div className="zform-dashboard-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="zform-dashboard-title">Get Hired</h1>
              <p className="zform-dashboard-subtitle">Welcome to your hiring dashboard</p>
            </div>
            <div className="zform-dashboard-icon">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="zform-dashboard-grid">
          {/* Umbrella Agreements Card */}
          {(currentUser?.roles.includes("ADMIN") || currentUser?.roles.includes("BACK_OFFICE")) && (
            <div className="zform-dashboard-card">
              <div className="zform-card-icon zform-card-icon-blue">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="zform-card-title">Umbrella Agreements</h3>
              <p className="zform-card-description">
                Manage umbrella agreements, send to employees, and track signing status.
              </p>
              <Link
                to="/dashboard/umbrella-agreements"
                className="zform-card-link zform-card-link-blue"
              >
                Manage Agreements
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Admin Panel Card */}
          {currentUser?.roles.includes("ADMIN") && (
            <div className="zform-dashboard-card">
              <div className="zform-card-icon zform-card-icon-green">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="zform-card-title">Admin Panel</h3>
              <p className="zform-card-description">
                Create and manage users, assign roles, and configure system settings.
              </p>
              <Link
                to="/dashboard/admin"
                className="zform-card-link zform-card-link-green"
              >
                Access Admin Panel
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Document Management Card */}
          <div className="zform-dashboard-card">
            <div className="zform-card-icon zform-card-icon-purple">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="zform-card-title">Document Management</h3>
            <p className="zform-card-description">
              View and manage all your documents, track status, and handle approvals.
            </p>
            <Link
              to="/dashboard/umbrella-agreements"
              className="zform-card-link zform-card-link-purple"
            >
              View Documents
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="zform-welcome-card">
          <h2 className="zform-welcome-title">Welcome, {currentUser?.designation}!</h2>
          <p className="zform-welcome-text">
            You're logged in as <span className="zform-welcome-highlight">{currentUser?.email}</span> with the following roles: 
            <span className="zform-welcome-highlight ml-1">
              {currentUser?.roles.join(', ')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
