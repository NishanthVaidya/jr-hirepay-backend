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
              <Link to="/dashboard/home" className="zforms__nav-logo-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="zforms__nav-logo-icon" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="zforms__nav-logo-text" style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '16px' }}>H</span>
                </div>
                <span className="zforms__nav-logo-title" style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>HirePay</span>
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
                  {(currentUser.roles.includes("FRONT_OFFICE")) && (
                    <Link to="/dashboard/documents" className="zforms__nav-link">My Documents</Link>
                  )}
                  {(currentUser.roles.includes("BACK_OFFICE") || currentUser.roles.includes("ADMIN")) && (
                    <Link to="/dashboard/scope-management" className="zforms__nav-link">Scope Management</Link>
                  )}
                  {(currentUser.roles.includes("BACK_OFFICE") || currentUser.roles.includes("ADMIN")) && (
                    <Link to="/dashboard/scope" className="zforms__nav-link">Scope Creation</Link>
                  )}
                  {(currentUser.roles.includes("FRONT_OFFICE")) && (
                    <Link to="/dashboard/my-scopes" className="zforms__nav-link">My Scopes</Link>
                  )}
                  <span className="zforms__nav-user">
                    {currentUser.fullName} ({currentUser.designation})
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
