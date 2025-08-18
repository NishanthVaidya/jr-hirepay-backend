import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold hover:text-blue-200">
                HirePay
              </Link>
            </div>
            
            <div className="flex items-center space-x-6">
              {currentUser && (
                <>
                  <Link to="/" className="hover:text-blue-200">Home</Link>
                  {currentUser.roles.includes("ADMIN") && (
                    <Link to="/admin" className="hover:text-blue-200">Admin</Link>
                  )}
                  {(currentUser.roles.includes("BACK_OFFICE") || currentUser.roles.includes("ADMIN")) && (
                    <Link to="/umbrella-agreements" className="hover:text-blue-200">Umbrella Agreements</Link>
                  )}
                  <span className="text-blue-200">
                    {currentUser.email} ({currentUser.designation})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm"
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
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
