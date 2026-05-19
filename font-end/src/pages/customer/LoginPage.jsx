import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { authApi } from '../../api/authApi';
import { useToast } from '../../contexts/ToastContext';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expiredMessage, setExpiredMessage] = useState('');

  const { login } = useAuth();
  const { syncGuestCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setExpiredMessage('Phiên làm việc của bạn đã kết thúc do không có thao tác trong thời gian dài. Vui lòng đăng nhập lại!');
      // Remove query param from URL so it doesn't stay if they refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(formData.email, formData.password);
      const { accessToken, fullName, id, userId: fallbackId } = response.data;

      // Sử dụng hàm login từ Context để lưu token và điều hướng
      const authData = login(accessToken, fullName, id || fallbackId);
      toast.success('Đăng nhập thành công!');

      // Đồng bộ giỏ hàng vãng lai (Offline Cart -> Backend)
      try {
        await syncGuestCart();
      } catch (e) {
        console.error("Failed to sync cart", e);
      }

      // Thông minh quay lại trang mà người dùng định đến (Ví dụ: Thanh toán)
      // Nhưng nếu là quyền Admin hoặc Staff thì ưu tiên đẩy vào trang quản trị (trừ phi đang ở giỏ hàng/thanh toán)
      const fromPath = location.state?.from || '/';
      
      const isAdminOrStaff = authData.role === 'ADMIN' || authData.role === 'ROLE_ADMIN' 
        || authData.role === 'STAFF' || authData.role === 'ROLE_STAFF'
        || authData.role === 'MANAGER' || authData.role === 'ROLE_MANAGER';
      
      if (isAdminOrStaff && fromPath === '/') {
        navigate('/admin', { replace: true });
      } else {
        navigate(fromPath, { replace: true });
      }

    } catch (error) {
      const backendMessage = error.response?.data?.message || '';
      
      // Chuyển đổi mã lỗi Backend sang Tiếng Việt
      let vnMessage = 'Lỗi đăng nhập. Vui lòng kiểm tra lại email và mật khẩu!';
      if (backendMessage === 'INVALID_PASSWORD') {
        vnMessage = 'Mật khẩu không chính xác.';
      } else if (backendMessage === 'USER_NOT_FOUND' || backendMessage === 'USER_NOT_EXIST') {
        vnMessage = 'Tài khoản không tồn tại.';
      } else if (backendMessage === 'USER_NOT_ACTIVE' || backendMessage === 'ACCOUNT_LOCKED') {
        vnMessage = 'Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt.';
      } else if (backendMessage) {
        // Nếu backend gửi về lời nhắn tiếng Anh khác chưa biết, tạm hiển thị
        // Hoặc có thể ẩn đi và dùng câu chung chung
        vnMessage = backendMessage; 
        // Thay thế luôn tiếng anh nếu nó chứa từ password, email...
        if (backendMessage.toLowerCase().includes('password')) vnMessage = 'Mật khẩu không hợp lệ.';
        if (backendMessage.toLowerCase().includes('email')) vnMessage = 'Email không hợp lệ.';
      }

      toast.error(vnMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left Side - Form */}
        <div className="login-left">
          <div className="login-form-wrapper">
            <h1 className="login-title">Chào mừng trở lại!</h1>
            <p className="login-subtitle">
              Đăng nhập để tiếp tục thưởng thức hương vị nướng đặc trưng của chúng tôi.
            </p>

            <form className="login-form" onSubmit={handleLogin}>
              {expiredMessage && (
                <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Star size={18} style={{ flexShrink: 0, marginTop: '2px' }}/> 
                  <span>{expiredMessage}</span>
                </div>
              )}
              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Nhập địa chỉ email của bạn"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="password-label-row">
                  <label>Mật khẩu</label>
                  <Link to="/forgot-password" className="forgot-password-link">Quên mật khẩu?</Link>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
              </button>

              <div className="register-prompt">
                Chưa có tài khoản? <Link to="/register">Tạo tài khoản mới</Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Image & Testimonial */}
        <div className="login-right">
          <div className="testimonial-card">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <p className="testimonial-quote">
              "Món ăn ở đây là ngon nhất mà tôi từng được thử. Không gian tuyệt vời và dịch vụ chuyên nghiệp!"
            </p>
            <div className="testimonial-author">
              {/* Bạn có thể mở lại thẻ avatar dưới đây nếu muốn hiển thị hình ảnh */}
              {/* <div className="author-avatar">
                <img src="https://i.pravatar.cc/150?img=47" alt="Trần Văn Tùng" />
              </div> */}
              <div className="author-info">
                <h4>Trần Văn Tùng</h4>
                <span>Khách hàng VIP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
