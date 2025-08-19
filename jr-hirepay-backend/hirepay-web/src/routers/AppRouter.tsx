import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../pages/Home';
import DashboardHome from '../pages/DashboardHome';
import Login from '../pages/Login';
import Admin from '../pages/Admin';
import DocumentManagement from '../pages/UmbrellaAgreementManagement';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/home" replace />} />
          <Route path="home" element={<DashboardHome />} />
          <Route path="admin" element={<Admin />} />
          <Route path="documents" element={<DocumentManagement />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
