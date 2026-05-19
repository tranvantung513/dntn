import React from 'react';
import { 
  LayoutDashboard, Layers, Box, Key, ShieldCheck, Users, Settings, Utensils, Tag, CalendarDays, ShoppingCart, ClipboardCheck, Banknote, LogOut, Home
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Mỗi menu item có `permission` là quyền VIEW cần có để thấy menu đó.
// Nếu `permission` là null => luôn hiển thị với mọi role được vào admin.
const ALL_MENUS = [
  { icon: <LayoutDashboard size={20} />, label: 'Tổng quan',            path: '/admin/dashboard',    permission: null },
  { icon: <ShoppingCart size={20} />,   label: 'Đơn hàng',              path: '/admin/orders',       permission: 'ORDER_VIEW' },
  { icon: <Box size={20} />,            label: 'Danh sách sản phẩm',    path: '/admin/products',     permission: 'PRODUCT_VIEW' },
  { icon: <Layers size={20} />,         label: 'Danh mục sản phẩm',     path: '/admin/categories',   permission: 'CATEGORY_VIEW' },
  { icon: <Tag size={20} />,            label: 'Khuyến mãi',             path: '/admin/promotions',   permission: 'DISCOUNT_VIEW' },
  { icon: <CalendarDays size={20} />,   label: 'Đặt bàn',               path: '/admin/reservations', permission: 'RESERVATION_VIEW' },
  { icon: <Users size={20} />,          label: 'Danh sách tài khoản',   path: '/admin/users',        permission: 'USER_VIEW' },
  { icon: <ClipboardCheck size={20} />, label: 'Chấm công',             path: '/admin/attendance',   permission: 'SALARY_VIEW' },
  { icon: <Banknote size={20} />,       label: 'Tiền lương',            path: '/admin/salary-config',permission: 'SALARY_VIEW' },
  { icon: <Key size={20} />,            label: 'Nhóm quyền',            path: '/admin/roles',        permission: 'USER_VIEW' },
  { icon: <ShieldCheck size={20} />,    label: 'Phân quyền',            path: '/admin/permissions',  permission: 'USER_VIEW' },
  { icon: <Settings size={20} />,       label: 'Cài đặt chung',         path: '/admin/settings',     permission: null, adminOnly: true },
  { icon: <Home size={20} />,           label: 'Trang chủ cửa hàng',    path: '/',                   permission: null },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, userPermissions, userFullName, logout } = useAuth();

  const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';

  // ADMIN thấy tất cả, các role khác chỉ thấy menu mình có quyền
  const visibleMenus = ALL_MENUS.filter(item => {
    if (item.adminOnly && !isAdmin) return false; // Chỉ Admin mới thấy menu có adminOnly
    if (!item.permission) return true;         // Dashboard luôn hiển thị
    if (isAdmin) return true;                  // ADMIN thấy tất cả
    return userPermissions.includes(item.permission);
  });

  return (
    <div className="sidebar">
      <Link to="/admin/dashboard" className="logo-container" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="logo-icon">
          <Utensils size={24} color="#fff" />
        </div>
        <div className="logo-text">
          <div className="logo-title">ADMIN</div>
          <div className="logo-subtitle">SAFFRON HARVEST</div>
        </div>
      </Link>
      
      <div className="menu-list">
        {visibleMenus.map((item, idx) => {
          const isActive = item.path === '/' ? false : location.pathname.startsWith(item.path);
          return (
            <Link to={item.path} key={idx} style={{ textDecoration: 'none' }}>
              <div className={`menu-item ${isActive ? 'active' : ''}`}>
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="user-profile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar"><Users size={20} color="#fff" /></div>
          <div className="user-info">
            <div className="user-name">{userFullName || 'Quản trị viên'}</div>
            <div className="user-email" style={{ fontSize: 11, opacity: 0.7, textTransform: 'capitalize' }}>
              {userRole?.replace('ROLE_', '') || 'Admin'}
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => { logout(); navigate('/login'); }} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px', borderRadius: '8px', display: 'flex' }}
          title="Đăng xuất"
          className="btn-icon bg-gray"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

const AdminLayout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
