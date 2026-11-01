import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/zynema';

interface ProtectedRouteProps {
  roles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container py-5 text-center text-white" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-3 text-white-50">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to login preserving from location
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role insufficient -> redirect to 403 Forbidden page
  if (roles && user.role && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};
