import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound, ArrowRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { authApi } from '../../api/authApi';
import { otpApi } from '../../api/otpApi';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [formData, setFormData] = useState({ 
    email: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    try {
      setLoading(true);
      await otpApi.send({ email: formData.email, type: 'FORGOT_PASSWORD' });
      toast.success('Đã gửi mã xác nhận OTP đến email của bạn!');
      setStep(2);
    } catch (error) {
      console.error("OTP Error:", error);
      toast.error(error.response?.data?.message || 'Gửi mã xác nhận thất bại! Vui lòng kiểm tra email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length === 0) {
      toast.error('Vui lòng nhập mã OTP!');
      return;
    }

    try {
      setLoading(true);
      
      // 1. Xác minh OTP trước
      await otpApi.verify({
        email: formData.email,
        otp: otpCode.trim(),
        type: 'FORGOT_PASSWORD'
      });

      // 2. Gọi API đổi pass
      await authApi.forgotPassword(formData.email, formData.newPassword, formData.confirmPassword);
      
      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');

    } catch (error) {
      const backendMessage = error.response?.data?.message || '';
      let vnMessage = 'Mã xác nhận không đúng hoặc đã hết hạn!';
      
      if (backendMessage === 'USER_NOT_FOUND' || backendMessage === 'USER_NOT_EXIST') {
        vnMessage = 'Tài khoản không tồn tại trong hệ thống.';
      } else if (backendMessage === 'OTP_EXPIRED' || backendMessage === 'INVALID_OTP') {
        vnMessage = 'Mã xác nhận không đúng hoặc đã hết hạn!';
      } else if (backendMessage) {
        vnMessage = backendMessage;
      }
      
      toast.error(vnMessage);
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await otpApi.send({ email: formData.email, type: 'FORGOT_PASSWORD' });
      toast.success('Đã gửi lại mã xác nhận OTP!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gửi lại mã thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-content">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} />
            Quay lại Đăng nhập
          </Link>
          
          {step === 1 ? (
            <>
              <h1 className="forgot-password-title">Quên mật khẩu?</h1>
              <p className="forgot-password-subtitle">
                Đừng lo lắng! Vui lòng nhập email của bạn và tạo mật khẩu mới để khôi phục truy cập.
              </p>

              <form className="forgot-password-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Địa chỉ Email</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Nhập email tài khoản của bạn"
                      value={formData.email}
                      onChange={handleInputChange}
                      onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập định dạng email hợp lệ')}
                      onInput={(e) => e.target.setCustomValidity('')}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Mật khẩu mới</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      required
                      placeholder="Nhập mật khẩu mới"
                      minLength={8}
                      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$"
                      title="Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)"
                      onInvalid={(e) => e.target.setCustomValidity('Mật khẩu bảo mật phải trên 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)')}
                      onInput={(e) => e.target.setCustomValidity('')}
                      value={formData.newPassword}
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

                <div className="input-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="toggle-password-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-reset" disabled={loading}>
                  {loading ? 'Đang gửi mã OTP...' : 'Cập nhật Mật khẩu'}
                </button>
              </form>
            </>
          ) : (
            <div className="otp-verification-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ alignSelf: 'flex-start', marginBottom: '16px' }}>
                <button type="button" onClick={() => setStep(1)} disabled={loading} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                  <ArrowLeft size={16} /> Quay lại
                </button>
              </div>
              
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: '#fffbeb', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' 
              }}>
                <KeyRound size={42} color="#f59e0b" />
              </div>
              
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px 0', color: '#1f2937' }}>Xác minh Email</h2>
              <p style={{ textAlign: 'center', fontSize: '15px', color: '#6b7280', margin: '0 0 32px 0', lineHeight: 1.5 }}>
                Vui lòng nhập mã bảo mật 6 số vừa được gửi đến email <br />
                <strong style={{ color: '#374151' }}>{formData.email}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="••••••"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase())}
                    style={{ 
                      width: '100%', padding: '16px', borderRadius: '12px', border: '1.5px solid #e5e7eb',
                      background: '#f9fafb', fontSize: '24px', letterSpacing: '8px', fontWeight: 700,
                      textAlign: 'center', color: '#1f2937', outline: 'none', transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <button type="submit" className="btn-reset" disabled={loading || otpCode.length < 3}>
                  {loading ? 'Đang kiểm tra...' : 'Xác nhận & Hoàn tất'}
                </button>

                <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                  Chưa nhận được mã?{' '}
                  <button type="button" onClick={handleResendOtp} disabled={loading} style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Gửi lại mã
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
