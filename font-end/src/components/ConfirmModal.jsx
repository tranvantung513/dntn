import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDangerous }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div className="modal-title-box">
             <div className="modal-icon" style={{ background: isDangerous ? '#fee2e2' : '#fef3c7' }}>
                <AlertCircle size={18} color={isDangerous ? '#dc2626' : '#d97706'} />
             </div>
             <h3>{title}</h3>
          </div>
          <button className="btn-close" onClick={onClose}>
             <X size={20} color="#666"/>
          </button>
        </div>
        
        <div className="modal-body" style={{ paddingTop: '10px', paddingBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>
        
        <div className="modal-footer" style={{ justifyContent: 'flex-end', borderTop: 'none', paddingTop: 0 }}>
          <button type="button" className="btn-cancel" onClick={onClose} style={{ flex: 'none', padding: '10px 24px', border: '1px solid #e5e7eb', background: '#fff' }}>Hủy</button>
          <button type="button" className="btn-submit" onClick={onConfirm} style={{ flex: 'none', padding: '10px 24px', background: isDangerous ? '#dc2626' : '#d97706' }}>
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
