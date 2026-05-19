import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';

const CustomerHeader = () => {
  const { cartCount } = useCart();
  const { isAuthenticated, userFullName, logout, userRole } = useAuth();
  const { globalSettings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
  const searchParams = new window.URLSearchParams(location.search);
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setKeyword(searchParams.get('search') || '');
  }, [location.search]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (keyword.trim()) {
         navigate(`/products?search=${encodeURIComponent(keyword.trim())}`);
      } else {
         navigate(`/products`);
      }
    }
  };

  return (
    <header className="customer-header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-area">
          <Link to="/" className="brand-logo">
            {globalSettings?.store_logo ? (
              <img src={globalSettings.store_logo} alt="Store Logo" style={{ height: '40px', objectFit: 'contain', marginRight: '8px' }} />
            ) : (
              <span className="logo-icon text-orange">🌿</span>
            )}
            <span className="logo-text">{globalSettings?.store_name || 'Saffron Harvest'}</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <Link to="/" className={`nav-link ${currentPath === '/' ? 'active' : ''}`}>Trang chủ</Link>
          <Link to="/products" className={`nav-link ${currentPath.includes('/products') ? 'active' : ''}`}>Thực đơn</Link>
          <Link to="/promotions" className={`nav-link ${currentPath.includes('/promotions') ? 'active' : ''}`}>Ưu đãi</Link>
          {isAuthenticated && (
             <>
               <Link to="/orders" className={`nav-link ${currentPath === '/orders' ? 'active' : ''}`}>Đơn hàng</Link>
               {userRole !== 'ROLE_USER' && (
                 <Link to="/attendance" className={`nav-link ${currentPath === '/attendance' ? 'active' : ''}`}>Chấm công</Link>
               )}
             </>
          )}
          <Link to="/booking" className={`nav-link ${currentPath === '/booking' ? 'active' : ''}`}>Đặt bàn</Link>
        </nav>

        {/* Search & Actions */}
        <div className="header-actions" style={{ alignItems: 'center' }}>
          {currentPath !== '/' && !currentPath.includes('/promotions') && currentPath !== '/register' && currentPath !== '/login' && currentPath !== '/forgot-password' && (
            <div className="customer-search-box">
              <Search size={18} className="customer-search-icon" />
              <input 
                type="text" 
                placeholder="Tìm kiếm món ăn..." 
                className="customer-search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          )}

          <Link to="/cart" className="cart-btn" style={{ marginRight: 16 }}>
             <ShoppingCart size={22} color="#1f2937" />
             <span className="cart-badge">{cartCount}</span>
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/profile" className="user-avatar-btn" title="Hồ sơ cá nhân" style={{ background: '#f3f4f6', borderRadius: '50%', padding: '6px' }}>
                 <User size={20} color="#4b5563" />
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>Xin chào,</span>
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userFullName || 'Khách hàng'}
                </span>
              </div>
              <button 
                onClick={logout} 
                className="header-btn-outline" 
                style={{ padding: '6px 12px', marginLeft: '4px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444' }}
                title="Đăng xuất"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              {currentPath !== '/login' && currentPath !== '/forgot-password' && (
                <Link to="/login" className="header-btn-outline">
                  Đăng nhập
                </Link>
              )}
              
              {currentPath !== '/register' && currentPath !== '/forgot-password' && (
                <Link to="/register" className="header-btn-primary">
                  Đăng ký
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
