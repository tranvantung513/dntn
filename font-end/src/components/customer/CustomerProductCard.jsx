import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { cartApi } from '../../api/cartApi';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../contexts/CartContext';
import './CustomerProductCard.css';

const CustomerProductCard = ({ item }) => {
  const toast = useToast();
  const { addToCartContext } = useCart();
  const fallbackImage = "https://via.placeholder.com/300x200?text=Saffron+Harvest";
  const formatImageUrl = (url) => {
    if (!url) return fallbackImage;
    if (url.startsWith('http')) return url;
    return `http://103.82.24.142:9090${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const isFeatured = item.isFeatured === true || item.featured === true;
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(item.price || 0) + ' VNĐ';
  const isOutOfStock = item.quantity === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    try {
      // Dùng hàm từ Context để tự động quyết định lưu Offline hay gọi BE Online
      await addToCartContext(item, 1);
      toast.success(`Đã thêm món "${item.name}" vào giỏ hàng!`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Thêm giỏ hàng thất bại.");
    }
  };

  return (
    <div className="customer-product-card" onClick={() => item.onViewDetails?.(item)}>
      <div className="image-wrapper">
        {isFeatured && (
          <div className="featured-badge">
            <Star size={12} fill="white" />
            Nổi bật
          </div>
        )}
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>Hết hàng</span>
          </div>
        )}
        <img src={formatImageUrl(item.thumbnail)} alt={item.name} />
      </div>
      <div className="card-content">
        <h3 className="product-name" title={item.name}>{item.name}</h3>
        <div className="product-price">{formattedPrice}</div>
        <p className="product-desc">
          {item.description || "Hương vị tuyệt hảo dành riêng cho bạn, được chế biến từ các nguyên liệu tươi ngon nhất."}
        </p>
        <div className="card-actions">
          <button 
            className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`} 
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            <ShoppingCart size={18} />
            <span>{isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProductCard;
