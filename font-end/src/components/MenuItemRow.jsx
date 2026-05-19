import React, { useState } from 'react';
import { Edit2, Archive, Trash2, Eye, Star } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { menuItemApi } from '../api/menuItemApi';

const MenuItemRow = ({ item, onEdit, onDelete, onView, onStatusChange }) => {
  // Use specific fallback URL or a placeholder if thumbnail is missing
  const fallbackImage = "https://via.placeholder.com/150?text=No+Image";
  
  const formatImageUrl = (url) => {
    if (!url) return fallbackImage;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Gắn cứng domain Backend nếu Backend chỉ lưu chuỗi đường dẫn tương đối (như '/uploads/...')
    return `http://103.82.24.142:9090${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const imageUrl = formatImageUrl(item.thumbnail);

  const isActived = item.isActive !== false;
  // Fallback to "featured" or "isFeatured" from API
  const isFeaturedAttr = item.isFeatured === true || item.featured === true;
  
  const [localActive, setLocalActive] = useState(isActived);
  const [localFeatured, setLocalFeatured] = useState(isFeaturedAttr);
  const [loading, setLoading] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(false);
  const toast = useToast();

  const handleToggleActive = async () => {
    try {
      setLoading(true);
      const newActiveState = !localActive;
      
      const payload = {
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        isActive: newActiveState
      };
      
      const catId = item.category?.id || item.categoryId;
      if (catId) {
        const parsedCatId = catId.toString().includes('-') ? catId : parseInt(catId, 10);
        payload.categoryId = parsedCatId;
        payload.category = { id: parsedCatId };
      }

      await menuItemApi.update(item.id, payload);
      setLocalActive(newActiveState);
      toast.success('Cập nhật trạng thái thành công!');
      if (onStatusChange) onStatusChange();
    } catch (err) {
      toast.error('Lỗi khi đổi trạng thái: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = async () => {
    try {
      setFeatureLoading(true);
      const newFeatureState = !localFeatured;
      await menuItemApi.toggleFeature(item.id);
      setLocalFeatured(newFeatureState);
      toast.success(newFeatureState ? 'Đã ghim nổi bật món ăn!' : 'Đã gỡ nổi bật món ăn!');
      // Update item externally if needed
      if (onStatusChange) onStatusChange();
    } catch (err) {
      toast.error('Lỗi khi đổi trạng thái nổi bật: ' + (err.response?.data?.message || err.message));
    } finally {
      setFeatureLoading(false);
    }
  };

  // Format price
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(item.price || 0) + ' VNĐ';

  return (
    <div className="table-row product-row">
      <div className="col-img">
        <img src={imageUrl} alt={item.name} className="thumbnail" />
      </div>
      <div className="col-name product-name-box">
        <span className="cat-name parent-name">{item.name}</span>
      </div>
      <div className="col-cat">
        <span className="cat-pill">{item.category?.name || 'Chưa phân loại'}</span>
      </div>
      <div className="col-price">
        {formattedPrice}
      </div>
      <div className="col-quantity" style={{ display: 'flex', justifyContent: 'center' }}>
        {item.quantity || 0}
      </div>
      <div className="col-status">
        <button 
          onClick={handleToggleActive}
          className={`status-tag ${localActive ? 'active' : 'inactive'}`}
          disabled={loading}
          style={{ cursor: loading ? 'wait' : 'pointer' }}
        >
          {localActive ? 'Hoạt động' : 'Không hoạt động'}
        </button>
      </div>
      <div className="col-feature" style={{ width: '90px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleToggleFeature}
          disabled={featureLoading}
          style={{
            background: 'none', border: 'none', cursor: featureLoading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px', borderRadius: '50%', transition: 'all 0.2s',
            boxShadow: localFeatured ? '0 0 10px rgba(234, 179, 8, 0.4)' : 'none',
            backgroundColor: localFeatured ? '#fefce8' : 'transparent'
          }}
          title={localFeatured ? 'Gỡ nổi bật' : 'Đánh dấu nổi bật'}
        >
          <Star 
            size={22} 
            color={localFeatured ? "#eab308" : "#9ca3af"} 
            fill={localFeatured ? "#eab308" : "none"} 
            strokeWidth={localFeatured ? 1 : 2}
          />
        </button>
      </div>
      <div className="col-action" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button onClick={() => onView(item)} title="Xem chi tiết" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f3f4f6', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Eye size={16} />
        </button>
        <button onClick={() => onEdit(item)} title="Chỉnh sửa" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fef3c7', color: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Edit2 size={16} />
        </button>
        <button onClick={() => onDelete(item.id)} title="Xóa" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default MenuItemRow;
