import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import './CustomerProductModal.css';

const CustomerProductModal = ({ item, onClose, onAddToCart }) => {
  if (!item) return null;

  const fallbackImage = "https://via.placeholder.com/600x400?text=Saffron+Harvest";
  const formatImageUrl = (url) => {
    if (!url) return fallbackImage;
    if (url.startsWith('http')) return url;
    return `http://103.82.24.142:9090${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN').format(item.price || 0) + ' VNĐ';
  const isOutOfStock = item.quantity === 0;

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-body">
          <div className="modal-image-section">
            <img src={formatImageUrl(item.thumbnail)} alt={item.name} />
          </div>

          <div className="modal-info-section">
            <div className="prd-modal-header">
              <div className="info-row">
                <span className="info-label">Danh mục:</span>
                <span className="info-value category-tag">{item.category?.name || "Món ăn"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Món:</span>
                <h2 className="info-value modal-title">{item.name}</h2>
              </div>
              <div className="info-row">
                <span className="info-label">Giá tiền:</span>
                <div className="info-value modal-price">{formattedPrice}</div>
              </div>
            </div>

            <div className="modal-description">
              <h3>Mô tả món ăn</h3>
              <p>{item.description || "Hương vị tuyệt hảo dành riêng cho bạn, được chế biến từ các nguyên liệu tươi ngon nhất, mang đến trải nghiệm ẩm thực đỉnh cao tại Saffron Harvest."}</p>
            </div>

            <div className="modal-actions">
              <button 
                className={`modal-add-btn ${isOutOfStock ? 'disabled' : ''}`} 
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  onAddToCart(item, 1);
                  onClose();
                }}
                style={isOutOfStock ? { background: '#9ca3af', cursor: 'not-allowed', boxShadow: 'none' } : {}}
              >
                <ShoppingCart size={24} />
                <span>{isOutOfStock ? 'Hết hàng' : `Thêm vào giỏ - ${formattedPrice}`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductModal;
