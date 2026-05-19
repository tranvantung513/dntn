import React, { useState, useEffect } from 'react';
import { X, FolderPlus, ChevronDown, Info, Edit, Star } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { categoryApi } from '../api/categoryApi';

const CategoryModal = ({ isOpen, onClose, categories, onReload, initialData }) => {
  const isEditMode = Boolean(initialData);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          parentId: initialData.parentId || '',
          description: initialData.description || '',
          active: initialData.active !== false && initialData.isActive !== false && initialData.status !== 0 && initialData.status !== 'INACTIVE'
        });
      } else {
        setFormData({ name: '', parentId: '', description: '', active: true });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        name: formData.name,
        description: formData.description,
        active: formData.active
      };

      if (formData.parentId) {
        payload.parentId = parseInt(formData.parentId, 10);
      }

      if (isEditMode) {
        await categoryApi.update(initialData.id, payload);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await categoryApi.create(payload);
        toast.success("Thêm mới danh mục thành công!");
      }
      
      onReload(); 
      onClose(); 
    } catch (err) {
      console.error(err);
      toast.error((isEditMode ? 'Lỗi cập nhật: ' : 'Lỗi tạo mới: ') + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = (cats, level = 0) => {
    return cats.map(cat => (
      <React.Fragment key={cat.id}>
        <option value={cat.id}>
          {'--'.repeat(level)} {cat.name}
        </option>
        {cat.children && renderOptions(cat.children, level + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title-box">
             <div className="modal-icon">
                {isEditMode ? <Edit size={18} color="#d97706" /> : <FolderPlus size={18} color="#d97706" />}
             </div>
             <div className="modal-titles">
               <h3>{isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h3>
               {isEditMode && <p className="modal-subtitle">Cập nhật thông tin chi tiết cho danh mục thực đơn.</p>}
             </div>
          </div>
          <button className="btn-close" onClick={onClose}>
             <X size={20} color="#666"/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>TÊN DANH MỤC</label>
            <div className="input-with-icon">
              <input 
                type="text" 
                name="name"
                placeholder="Nhập tên danh mục (vd: Khai vị)"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {isEditMode && <Star size={14} color="#f59e0b" className="input-right-icon" fill="#f59e0b" />}
            </div>
          </div>
          
          {isEditMode && (
            <div className="form-group">
              <label>TRẠNG THÁI</label>
              <div className="select-wrapper">
                <select 
                  name="active" 
                  value={formData.active} 
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                  style={{ fontWeight: '500', color: formData.active ? '#10b981' : '#6b7280' }}
                >
                  <option value={true}>Hoạt động</option>
                  <option value={false}>Không hoạt động</option>
                </select>
                <div className="select-icon"><ChevronDown size={18} color="#999" /></div>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>DANH MỤC CHA</label>
            <div className="select-wrapper">
              <select name="parentId" value={formData.parentId} onChange={handleChange}>
                <option value="">Không có (Danh mục gốc)</option>
                {renderOptions(categories)}
              </select>
              <div className="select-icon"><ChevronDown size={18} color="#999" /></div>
            </div>
          </div>
          
          <div className="form-group">
            <label>MÔ TẢ</label>
            <textarea 
              name="description"
              placeholder="Viết vài dòng mô tả về danh mục này..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              maxLength={200}
            ></textarea>
            {isEditMode && <div className="char-count">Tối đa 200 ký tự</div>}
          </div>
          
          {isEditMode && (
            <div className="warning-alert">
              <div className="warning-icon-bg">
                <Info size={16} color="#d97706" />
              </div>
              <p>Thay đổi này sẽ ảnh hưởng đến cách khách hàng nhìn thấy thực đơn trên ứng dụng di động ngay lập tức.</p>
            </div>
          )}

          <div className="modal-footer" style={{ justifyContent: isEditMode ? 'flex-end' : 'auto' }}>
            <button type="button" className="btn-cancel" onClick={onClose} style={isEditMode ? { flex: 'none', padding: '10px 24px', border: 'none', background: 'transparent' } : {}}>Hủy</button>
            <button type="submit" className="btn-submit" disabled={loading} style={isEditMode ? { flex: 'none', padding: '10px 32px' } : {}}>
              {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Lưu danh mục')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CategoryModal;
