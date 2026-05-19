import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ShieldCheck, ArrowRight, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { userApi } from '../../api/userApi';
import { otpApi } from '../../api/otpApi';
import { useToast } from '../../contexts/ToastContext';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu và Xác nhận mật khẩu không khớp!');
      return;
    }
    if (!formData.agreeTerms) {
      toast.error('Bạn cần đồng ý với Điều khoản & Chính sách!');
      return;
    }

    // Validate Phone naturally or with regex if desired, we'll let HTML5 handle most if configured.
    // The previous phone regex we used in admin:
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam chuẩn (10 số).");
      return;
    }

    try {
      setLoading(true);
      await otpApi.send({ email: formData.email, type: 'REGISTER' });
      toast.success('Đã gửi mã xác nhận OTP đến email của bạn!');
      setStep(2);
    } catch (error) {
      console.error("OTP Error:", error);
      toast.error(error.response?.data?.message || 'Gửi mã xác nhận thất bại!');
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
      await otpApi.verify({
        email: formData.email,
        otp: otpCode.trim(),
        type: 'REGISTER'
      });

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: "MALE",
        dateOfBirth: "2000-01-01T00:00:00",
        status: "ACTIVE"
      };

      // Gọi endpoint public /auth/register (không cần JWT)
      await axios.post('/auth/register', payload);
      toast.success('Đăng ký tài khoản thành công!');
      navigate('/login');
    } catch (error) {
      console.error("Register Error:", error);
      toast.error(error.response?.data?.message || 'Mã xác nhận không đúng hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await otpApi.send({ email: formData.email, type: 'REGISTER' });
      toast.success('Đã gửi lại mã xác nhận OTP!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gửi lại mã thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Lớp hiển thị Ảnh phía bên trái */}
        <div className="register-left">
          <div className="register-left-content">
            <h1>Hương vị đích thực từ ngọn lửa</h1>
            <p>Đăng ký ngay để nhận những ưu đãi hấp dẫn đến từ cửa hàng nhé.</p>
          </div>
        </div>

        {/* Form đăng ký phía bên phải */}
        <div className="register-right">
          <div className="register-form-wrapper">
            {step === 1 ? (
              <>
                <h2 className="register-title">Tạo tài khoản mới</h2>
                <p className="register-subtitle">Tham gia cộng đồng Flame&Grilled để trải nghiệm tinh hoa ẩm thực đồ nướng.</p>

                <form onSubmit={handleSubmit} className="register-form">
                  <div className="input-group">
                    <label>Họ và tên</label>
                    <div className="input-wrapper">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        required
                        placeholder="Tên của bạn"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Địa chỉ Email</label>
                    <div className="input-wrapper">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        required
                        placeholder="example@gmail.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập email hợp lệ')}
                        onInput={(e) => e.target.setCustomValidity('')}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Số điện thoại</label>
                    <div className="input-wrapper">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        required
                        pattern="0[35789][0-9]{8}"
                        title="10 chữ số, ví dụ 0987654321"
                        placeholder="0901234567"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập định dạng SĐT Việt Nam hợp lệ (10 số)')}
                        onInput={(e) => e.target.setCustomValidity('')}
                      />
                    </div>
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label>Mật khẩu</label>
                      <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="********"
                          minLength={8}
                          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$"
                          title="Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)"
                          onInvalid={(e) => e.target.setCustomValidity('Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)')}
                          onInput={(e) => e.target.setCustomValidity('')}
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Xác nhận</label>
                      <div className="input-wrapper">
                        <ShieldCheck size={18} className="input-icon" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          placeholder="********"
                          minLength={8}
                          value={formData.confirmPassword}
                          onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="terms-group">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      />
                      <span className="checkmark"></span>
                      <span className="terms-text">
                        Tôi đồng ý với <a href="#">Điều khoản & Chính sách</a>
                      </span>
                    </label>
                  </div>

                  <button type="submit" className="btn-register" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đăng ký ngay'} <ArrowRight size={18} />
                  </button>

                  <div className="login-prompt">
                    Bạn đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                  </div>
                </form>
              </>
            ) : (
              <div className="otp-verification-step">
                <button type="button" className="btn-back-step" onClick={() => setStep(1)} disabled={loading}>
                  <ArrowLeft size={16} /> Quay lại
                </button>
                <div className="otp-icon-wrapper">
                  <KeyRound size={42} className="text-orange" />
                </div>
                <h2 className="register-title" style={{ textAlign: 'center' }}>Xác minh Email</h2>
                <p className="register-subtitle" style={{ textAlign: 'center', marginBottom: 24 }}>
                  Vui lòng nhập mã bảo mật 6 số vừa được gửi đến email <br />
                  <strong>{formData.email}</strong>
                </p>

                <form onSubmit={handleVerifyOtp} className="register-form">
                  <div className="input-group">
                    <div className="input-wrapper otp-input-wrapper">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase())}
                        style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700, paddingLeft: 16 }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-register" disabled={loading || otpCode.length < 3}>
                    {loading ? 'Đang kiểm tra...' : 'Xác nhận & Hoàn tất'} <ArrowRight size={18} />
                  </button>

                  <div className="login-prompt" style={{ marginTop: 16 }}>
                    Chưa nhận được mã?{' '}
                    <button type="button" className="btn-resend-otp" onClick={handleResendOtp} disabled={loading}>
                      Gửi lại mã
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="register-footer">
        © 2026 Saffron Harvest. Tất cả các quyền được bảo lưu.
      </div>
    </div>
  );
};

export default RegisterPage;
