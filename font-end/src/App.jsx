import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import CategoryPage from './pages/CategoryPage';
import MenuItemPage from './pages/MenuItemPage';
import DiscountPage from './pages/DiscountPage';
import OrderPage from './pages/OrderPage';
import UserPage from './pages/UserPage';
import RolePage from './pages/RolePage';
import PermissionPage from './pages/PermissionPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ReservationPage from './pages/ReservationPage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import SalaryConfigPage from './pages/SalaryConfigPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import CustomerLayout from './layouts/CustomerLayout';
import CustomerHomePage from './pages/customer/CustomerHomePage';
import CustomerProductsPage from './pages/customer/CustomerProductsPage';
import CustomerPromotionsPage from './pages/customer/CustomerPromotionsPage';
import CustomerCartPage from './pages/customer/CustomerCartPage';
import CustomerCheckoutPage from './pages/customer/CustomerCheckoutPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerBookingPage from './pages/customer/CustomerBookingPage';
import RegisterPage from './pages/customer/RegisterPage';
import LoginPage from './pages/customer/LoginPage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
import AttendancePage from './pages/customer/AttendancePage';
import ForbiddenPage from './pages/ForbiddenPage';
import AdminRouteGuard from './components/AdminRouteGuard';
import SessionExpiredModal from './components/SessionExpiredModal';
import './index.css';

import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import useSessionTimeout from './hooks/useSessionTimeout';

// Inner component để truy cập AuthContext
function AppInner() {
  const { isAuthenticated, logout } = useAuth();

  // 30 phút không thao tác → cảnh báo 2 phút trước → hết hạn
  useSessionTimeout(30 * 60 * 1000, 2 * 60 * 1000, isAuthenticated);

  const handleGoToLogin = () => {
    logout();
  };

  return (
    <>
      <SessionExpiredModal onGoToLogin={handleGoToLogin} />
      <BrowserRouter>
        <Routes>
          {/* ADMIN ROUTES */}
          <Route path="/admin/*" element={
            <AdminRouteGuard>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="categories" element={<CategoryPage />} />
                  <Route path="products" element={<MenuItemPage />} />
                  <Route path="promotions" element={<DiscountPage />} />
                  <Route path="orders" element={<OrderPage />} />
                  <Route path="users" element={<UserPage />} />
                  <Route path="roles" element={<RolePage />} />
                  <Route path="permissions" element={<PermissionPage />} />
                  <Route path="reservations" element={<ReservationPage />} />
                  <Route path="attendance" element={<AdminAttendancePage />} />
                  <Route path="salary-config" element={<SalaryConfigPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Routes>
              </AdminLayout>
            </AdminRouteGuard>
          } />

          {/* STANDALONE ROUTES */}
          <Route path="/403" element={<ForbiddenPage />} />

          {/* CUSTOMER ROUTES */}
          <Route path="/*" element={
            <CustomerLayout>
              <Routes>
                <Route path="/" element={<CustomerHomePage />} />
                <Route path="/products" element={<CustomerProductsPage />} />
                <Route path="/promotions" element={<CustomerPromotionsPage />} />
                <Route path="/cart" element={<CustomerCartPage />} />
                <Route path="/checkout" element={<CustomerCheckoutPage />} />
                <Route path="/orders" element={<CustomerOrdersPage />} />
                <Route path="/booking" element={<CustomerBookingPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="*" element={<div style={{padding: '100px', textAlign: 'center'}}>Trang đang cập nhật...</div>} />
              </Routes>
            </CustomerLayout>
          } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <CartProvider>
          <AuthProvider>
            <AppInner />
          </AuthProvider>
        </CartProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}

export default App;
