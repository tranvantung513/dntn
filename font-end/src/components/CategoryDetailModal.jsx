import React from 'react';
import { X, Eye } from 'lucide-react';

const CategoryDetailModal = ({ isOpen, onClose, category }) => {
  if (!isOpen || !category) return null;

  const isActive = category.active !== false && category.isActive !== false && category.status !== 0 && category.status !== 'INACTIVE';
  const getStatusText = (active) => (active ? "Hoạt động" : "Không hoạt động");

  const itemCount = category.itemCount ?? category.quantity ?? category.productCount ?? 0;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-title-box">
             <div className="modal-icon">
                <Eye size={18} color="#d97706" />
             </div>
             <div className="modal-titles">
               <h3>Chi tiết danh mục</h3>
             </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} color="#666"/></button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', fontSize: '15px', alignItems: 'center' }}>
                 <span style={{ width: '130px', color: '#6b7280', fontWeight: 600 }}>Tên danh mục:</span>
                 <span style={{ fontWeight: 700, color: '#111827', fontSize: '16px' }}>{category.name}</span>
              </div>
              
              <div style={{ display: 'flex', fontSize: '15px', alignItems: 'center' }}>
                 <span style={{ width: '130px', color: '#6b7280', fontWeight: 600 }}>Cấp bậc:</span>
                 <span style={{ fontWeight: 600, color: '#374151', fontSize: '14px', background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px' }}>
                    {category.parent ? `Con của "${category.parent.name}"` : 'Danh mục gốc'}
                 </span>
              </div>
              
              <div style={{ display: 'flex', fontSize: '15px', alignItems: 'center' }}>
                 <span style={{ width: '130px', color: '#6b7280', fontWeight: 600 }}>Số lượng món:</span>
                 <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '16px' }}>{itemCount} món</span>
              </div>
              
               <div style={{ display: 'flex', fontSize: '15px', alignItems: 'center' }}>
                 <span style={{ width: '130px', color: '#6b7280', fontWeight: 600 }}>Trạng thái:</span>
                 <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: isActive ? '#d1fae5' : '#f3f4f6', color: isActive ? '#059669' : '#4b5563' }}>
                    {getStatusText(isActive)}
                 </span>
              </div>
           </div>
           
           <div>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase' }}>Mô tả danh mục</p>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>
                 {category.description ? category.description : <i style={{ color: '#9ca3af' }}>Không có mô tả cho danh mục này.</i>}
              </div>
           </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
          <button type="button" className="btn-cancel" onClick={onClose} style={{ padding: '10px 24px', background: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;
