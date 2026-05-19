import React, { useState, useEffect } from 'react';
import { Save, Store, Phone, Mail, MapPin, Clock, DollarSign, Globe, Link as LinkIcon, Image as ImageIcon, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { settingsApi } from '../../api/settingsApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './AdminSettingsPage.css';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    store_name: '',
    store_description: '',
    store_logo: '',
    store_phone: '',
    store_email: '',
    store_address: '',
    opening_hours: '',
    delivery_fee: '',
    facebook_url: '',
    instagram_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';
    if (!isAdmin) {
      toast.error('Bạn không có quyền truy cập trang Cài đặt chung.');
      navigate('/admin/dashboard');
      return;
    }
    fetchSettings();
  }, [userRole, navigate, toast]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getAllAsMap();
      const data = res.data?.data || res.data || {};
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error("Lỗi lấy cài đặt:", err);
      toast.error("Không thể lấy dữ liệu cài đặt chung!");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.updateMultiple(settings);
      toast.success("Đã lưu cài đặt thành công!");
    } catch (err) {
      console.error("Lỗi lưu cài đặt:", err);
      toast.error("Đã xảy ra lỗi khi lưu cài đặt.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await settingsApi.uploadLogo(formData);
      const url = res.data?.url;
      if (url) {
        setSettings(prev => ({ ...prev, store_logo: url }));
        toast.success("Đã tải lên logo thành công!");
      }
    } catch (err) {
      console.error("Lỗi upload logo:", err);
      toast.error("Lỗi tải lên logo!");
    } finally {
      setUploadingLogo(false);
      e.target.value = null; // reset input
    }
  };

  if (loading) {
    return <div className="admin-loading">Đang tải cấu hình...</div>;
  }

  return (
    <div className="admin-settings-page">
      <div className="header-top">
        <div className="page-title-area">
          <h1>Cài đặt chung</h1>
          <p>Quản lý các thông tin cơ bản và cấu hình hoạt động của nhà hàng.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Save size={18} />
            <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>

      <div className="settings-content" style={{ padding: '24px' }}>
        {/* THÔNG TIN CHUNG */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Store size={20} className="section-icon text-orange" />
            <h2>Thông tin cửa hàng</h2>
          </div>
          <div className="settings-card-body">
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Logo nhà hàng</label>
              <div className="logo-upload-container">
                {settings.store_logo ? (
                  <img src={settings.store_logo} alt="Store Logo" className="store-logo-preview" />
                ) : (
                  <div className="store-logo-placeholder">
                    <ImageIcon size={32} color="#9ca3af" />
                  </div>
                )}
                <div className="logo-upload-actions">
                  <label className="btn-upload-logo" disabled={uploadingLogo}>
                    <Upload size={16} />
                    <span>{uploadingLogo ? 'Đang tải lên...' : 'Tải lên ảnh mới'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      disabled={uploadingLogo} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  <p className="upload-hint">Định dạng JPG, PNG hoặc GIF. Kích thước tối đa 2MB.</p>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Tên nhà hàng</label>
              <input
                type="text"
                name="store_name"
                value={settings.store_name || ''}
                onChange={handleInputChange}
                className="form-control"
                placeholder="Ví dụ: Saffron Harvest"
              />
            </div>
            <div className="form-group">
              <label>Mô tả ngắn</label>
              <textarea
                name="store_description"
                value={settings.store_description || ''}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Câu châm ngôn hoặc mô tả ngắn gọn về nhà hàng..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* LIÊN HỆ */}
        <div className="settings-card">
          <div className="settings-card-header">
            <MapPin size={20} className="section-icon text-blue" />
            <h2>Thông tin liên hệ</h2>
          </div>
          <div className="settings-card-body grid-2-cols">
            <div className="form-group">
              <label><Phone size={14} className="inline-icon" /> Số điện thoại</label>
              <input
                type="text"
                name="store_phone"
                value={settings.store_phone || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label><Mail size={14} className="inline-icon" /> Email hỗ trợ</label>
              <input
                type="email"
                name="store_email"
                value={settings.store_email || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group full-width">
              <label>Địa chỉ</label>
              <input
                type="text"
                name="store_address"
                value={settings.store_address || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>
        </div>

      {/* VẬN HÀNH */}
        <div className="settings-card">
          <div className="settings-card-header">
            <Clock size={20} className="section-icon text-green" />
            <h2>Vận hành</h2>
          </div>
          <div className="settings-card-body grid-2-cols">
            <div className="form-group">
              <label>Giờ mở cửa</label>
              <input
                type="text"
                name="opening_hours"
                value={settings.opening_hours || ''}
                onChange={handleInputChange}
                className="form-control"
                placeholder="VD: 08:00 - 22:00"
              />
            </div>
            <div className="form-group">
              <label><DollarSign size={14} className="inline-icon" /> Phí giao hàng cơ bản (VNĐ)</label>
              <input
                type="number"
                name="delivery_fee"
                value={settings.delivery_fee || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
