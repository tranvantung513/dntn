import React, { useState, useEffect } from 'react';
import { X, PlusCircle, ChevronDown, Edit, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { menuItemApi } from '../api/menuItemApi';

const MenuItemModal = ({ isOpen, onClose, categories, onReload, initialData }) => {
  const isEditMode = Boolean(initialData);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    quantity: '',
    description: '',
    isActive: true
  });
  
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          categoryId: initialData.category?.id || '',
          price: initialData.price || '',
          quantity: initialData.quantity || '',
          description: initialData.description || '',
          isActive: initialData.isActive !== false
        });
        const formatImageUrl = (url) => {
          if (!url) return null;
          if (url.startsWith('http://') || url.startsWith('https://')) return url;
          return `http://103.82.24.142:9090${url.startsWith('/') ? '' : '/'}${url}`;
        };
        setPreviewUrl(formatImageUrl(initialData.thumbnail));
        setThumbnailFile(null);
      } else {
        setFormData({ name: '', categoryId: '', price: '', quantity: '', description: '', isActive: true });
        setThumbnailFile(null);
        setPreviewUrl(null);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price || 0),
        quantity: parseInt(formData.quantity || 0, 10),
        isActive: formData.isActive
      };
      // Send Category object skeleton if backend expects nested ID
      if (formData.categoryId) {
         const catId = formData.categoryId.toString().includes('-') ? formData.categoryId : parseInt(formData.categoryId, 10);
         payload.categoryId = catId; // Mapping cho DTO phẳng (Phổ biến nhất)
         payload.category = { id: catId }; // Mapping cho Entity lồng nhau
      }

      let savedItemId;

      if (isEditMode) {
        const res = await menuItemApi.update(initialData.id, payload);
        savedItemId = initialData.id;
        toast.success("Cập nhật món thành công!");
      } else {
        const res = await menuItemApi.create(payload);
        // Trích xuất chính xác ID, không gán bừa nguyên cục Object gây lỗi URL quá dài (431 Header Too Large)
        const possibleId = res.data?.data?.id || res.data?.id || res.data?.result?.id || res.data?.content?.id;
        savedItemId = possibleId || (typeof res.data === 'string' || typeof res.data === 'number' ? res.data : null);
        
        if (!savedItemId) {
          console.warn("Backend không trả về ID món ăn vừa tạo! Đã bỏ qua bước upload ảnh.", res.data);
        }
        toast.success("Thêm mới món thành công!");
      }
      
      // Upload ảnh nểu có chọn ảnh mới
      if (thumbnailFile && savedItemId) {
        const formImg = new FormData();
        formImg.append("thumbnail", thumbnailFile);
        // formImg.append("images", thumbnailFile); // Nếu backend bắt buộc có
        await menuItemApi.uploadImages(savedItemId, formImg);
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

  // Render option categories flatten
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
                {isEditMode ? <Edit size={18} color="#d97706" /> : <PlusCircle size={18} color="#d97706" />}
             </div>
             <div className="modal-titles">
               <h3>{isEditMode ? 'Chỉnh sửa món' : 'Thêm món mới'}</h3>
               {isEditMode && <p className="modal-subtitle">Cập nhật thông tin chi tiết cho món.</p>}
             </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} color="#666"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>TÊN MÓN</label>
              <input type="text" name="name" placeholder="VD: Truffle Beef Burger" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>ĐƠN GIÁ (VNĐ)</label>
              <input type="number" name="price" placeholder="VD: 450000" value={formData.price} onChange={handleChange} required />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>DANH MỤC</label>
              <div className="select-wrapper">
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">-- Chọn danh mục --</option>
                  {renderOptions(categories)}
                </select>
                <div className="select-icon"><ChevronDown size={18} color="#999" /></div>
              </div>
            </div>
            
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>SỐ LƯỢNG</label>
              <input type="number" name="quantity" placeholder="VD: 100" value={formData.quantity} onChange={handleChange} required min="0" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>TRẠNG THÁI</label>
              <div className="select-wrapper">
                <select name="isActive" value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}>
                  <option value={true}>Hoạt động</option>
                  <option value={false}>Không hoạt động</option>
                </select>
                <div className="select-icon"><ChevronDown size={18} color="#999" /></div>
              </div>
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
          
          <div className="form-group">
             <label>HÌNH ẢNH (THUMBNAIL)</label>
             <div className="image-upload-box">
                {previewUrl && <img src={previewUrl} alt="Preview" className="img-preview" />}
                <div className="upload-controls">
                   <input type="file" accept="image/*" onChange={handleFileChange} id="file-uploader" style={{display: 'none'}}/>
                   <label htmlFor="file-uploader" className="btn-upload"><ImageIcon size={16}/> Chọn ảnh mới</label>
                </div>
             </div>
          </div>

          <div className="form-group">
            <label>MÔ TẢ</label>
            <textarea name="description" placeholder="Mô tả về món..." value={formData.description} onChange={handleChange} rows="3"></textarea>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn-cancel" onClick={onClose} style={{ padding: '10px 24px', background: 'transparent', border: 'none' }}>Hủy</button>
            <button type="submit" className="btn-submit" disabled={loading} style={{ padding: '10px 32px' }}>
              {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Thêm món')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default MenuItemModal;
