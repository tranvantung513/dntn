import React from 'react';
import { Send } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const CustomerFooter = () => {
  const { globalSettings } = useSettings();
  return (
    <footer className="customer-footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand">
          <div className="brand-logo">
            {globalSettings?.store_logo ? (
              <img src={globalSettings.store_logo} alt="Store Logo" style={{ height: '40px', objectFit: 'contain', marginRight: '8px', filter: 'brightness(0) invert(1)' }} />
            ) : (
              <span className="logo-icon text-orange">🌿</span>
            )}
            <span className="logo-text">{globalSettings?.store_name || 'Saffron Harvest'}</span>
          </div>
          <p className="brand-desc">
            {globalSettings?.store_description || 'Kiến tạo những trải nghiệm ẩm thực khó quên từ năm 1998. Chúng tôi tin vào phép màu của nguyên liệu tươi sạch và hương vị địa phương.'}
          </p>
        </div>

        {/* Links Column 1 */}
        <div className="footer-links">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><a href="#">Thực đơn chính</a></li>
            <li><a href="#">Ưu đãi mùa</a></li>
            <li><a href="#">Danh sách rượu</a></li>
            <li><a href="#">Sự kiện riêng</a></li>
          </ul>
        </div>

        {/* Contact Column 2 */}
        <div className="footer-links">
          <h4>Liên hệ</h4>
          <ul style={{ gap: '16px' }}>
            <li style={{ display: 'flex', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
              <span className="text-orange">📍</span> {globalSettings?.store_address || '123 Đại lộ Ẩm thực, TP. Thức Ăn'}
            </li>
            <li style={{ display: 'flex', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
              <span className="text-orange">📞</span> {globalSettings?.store_phone || '+1 (555) 000-1234'}
            </li>
            <li style={{ display: 'flex', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
              <span className="text-orange">✉️</span> {globalSettings?.store_email || 'hello@saffronharvest.com'}
            </li>
            <li style={{ display: 'flex', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
              <span className="text-orange">🕒</span> {globalSettings?.opening_hours || '08:00 - 22:00'}
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="footer-newsletter">
          <h4>Bản tin</h4>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
            Đăng ký để nhận những ưu đãi và công thức nấu ăn độc quyền.
          </p>
          <div className="newsletter-form">
            <input type="email" placeholder="Địa chỉ email" />
            <button className="btn-send"><Send size={18} color="#111827" /></button>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} {globalSettings?.store_name || 'Saffron Harvest'}. Bảo lưu mọi quyền.</p>
        <div className="footer-bottom-links">
          {globalSettings?.facebook_url && <a href={globalSettings.facebook_url} target="_blank" rel="noopener noreferrer">Facebook</a>}
          {globalSettings?.instagram_url && <a href={globalSettings.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a>}
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản dịch vụ</a>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;
