import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRouteGuard = ({ children }) => {
  const { isAuthenticated, loading, userRole } = useAuth();

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Đang xác thực thông tin...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role từ Context hoặc Session Storage để tránh race condition
  const currentRole = userRole || sessionStorage.getItem('userRole');

  // Chỉ ADMIN, STAFF, MANAGER (hoặc ROLE_ADMIN, ROLE_STAFF, ROLE_MANAGER) mới được vào trang Quản trị
  const isAdmin = currentRole === 'ADMIN' || currentRole === 'ROLE_ADMIN';
  const isStaff = currentRole === 'STAFF' || currentRole === 'ROLE_STAFF';
  const isManager = currentRole === 'MANAGER' || currentRole === 'ROLE_MANAGER';

  if (!isAdmin && !isStaff && !isManager) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default AdminRouteGuard;
