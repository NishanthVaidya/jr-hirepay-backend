import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navigationItems = [
    { path: '/dashboard/home', label: 'Home', roles: ['ADMIN', 'BACK_OFFICE', 'FRONT_OFFICE'] },
    { path: '/dashboard/admin', label: 'Admin', roles: ['ADMIN'] },
    { path: '/dashboard/umbrella-agreements', label: 'Umbrella Agreements', roles: ['ADMIN', 'BACK_OFFICE'] },
  ];

  return (
    <div className="zforms-layout">
      {/* Navigation */}
      <nav className="zforms__nav">
        <div className="zforms__nav-container">
          <div className="zforms__nav-content">
            {/* Logo */}
            <div className="zforms__nav-logo">
              <Link to="/dashboard/home" className="zforms__nav-logo-link">
                <div className="zforms__nav-logo-icon">
                  <span className="zforms__nav-logo-text">H</span>
                </div>
                <span className="zforms__nav-logo-title">HirePay</span>
              </Link>
            </div>
            
            <div className="zforms__nav-menu">
              {currentUser && (
                <>
                  <Link to="/dashboard/home" className="zforms__nav-link">Home</Link>
                  {currentUser.roles.includes("ADMIN") && (
                    <Link to="/dashboard/admin" className="zforms__nav-link">Admin</Link>
                  )}
                  {(currentUser.roles.includes("BACK_OFFICE") || currentUser.roles.includes("ADMIN")) && (
                    <Link to="/dashboard/documents" className="zforms__nav-link">Documents</Link>
                  )}
                  {(currentUser.roles.includes("BACK_OFFICE") || currentUser.roles.includes("ADMIN") || currentUser.roles.includes("FRONT_OFFICE")) && (
                    <Link to="/dashboard/scope" className="zforms__nav-link">Scope Creation</Link>
                  )}
                  <span className="zforms__nav-user">
                    {currentUser.email} ({currentUser.designation})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="zforms__nav-button"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="zforms__main">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
