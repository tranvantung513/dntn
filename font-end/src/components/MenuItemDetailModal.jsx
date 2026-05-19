import React from 'react';
import { X, Eye } from 'lucide-react';

const MenuItemDetailModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const fallbackImage = "https://via.placeholder.com/200?text=No+Image";
  const formatImageUrl = (url) => {
    if (!url) return fallbackImage;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://103.82.24.142:9090${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getStatusText = (isActive) => (isActive !== false ? "Hoạt động" : "Không hoạt động");
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(item.price || 0) + ' VNĐ';

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-title-box">
             <div className="modal-icon">
                <Eye size={18} color="#d97706" />
             </div>
             <div className="modal-titles">
               <h3>Chi tiết món</h3>
             </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} color="#666"/></button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <img 
                 src={formatImageUrl(item.thumbnail)} 
                 alt={item.name}
                 style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e5e7eb' }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                 <div style={{ display: 'flex', fontSize: '15px', alignItems: 'center' }}>
                    <span style={{ width: '100px', color: '#6b7280', fontWeight: 600 }}>Tên món:</span>
                    <span style={{ fontWeight: 700, color: '#111827', fontSize: '16px' }}>{item.name}</span>
                 </div>
                 
                 <div style={{ display: 'flex', fontSize: '15px', alignItems: 'center' }}>
                    <span style={{ width: '100px', color: '#6b7280', fontWeight: 600 }}>Đơn giá:</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '16px' }}>{formattedPrice}</span>
                 </div>
                 
                 <div style={{ display: 'flex', fontSize: '15px', alignItems: 'center' }}>
                    <span style={{ width: '100px', color: '#6b7280', fontWeight: 600 }}>Số lượng:</span>
                    <span style={{ fontWeight: 700, color: '#111827', fontSize: '16px' }}>{item.quantity || 0}</span>
                 </div>
                 
                 <div style={{ display: 'flex', fontSize: '15px', alignItems: 'center' }}>
                    <span style={{ width: '100px', color: '#6b7280', fontWeight: 600 }}>Danh mục:</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{item.category?.name || 'Không có'}</span>
                 </div>
                 
                 <div style={{ display: 'flex', fontSize: '15px', alignItems: 'center' }}>
                    <span style={{ width: '100px', color: '#6b7280', fontWeight: 600 }}>Trạng thái:</span>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: item.isActive !== false ? '#d1fae5' : '#f3f4f6', color: item.isActive !== false ? '#059669' : '#4b5563' }}>
                       {getStatusText(item.isActive)}
                    </span>
                 </div>
              </div>
           </div>
           
           <div>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: 500 }}>MÔ TẢ MÓN</p>
              <div style={{ marginTop: '8px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>
                 {item.description ? item.description : <i>Không có mô tả cho món này.</i>}
              </div>
           </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn-cancel" onClick={onClose} style={{ padding: '10px 24px', background: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemDetailModal;
