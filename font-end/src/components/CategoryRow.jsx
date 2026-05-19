import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Edit2, Trash2, Eye } from 'lucide-react';

const CategoryRow = ({ category, level = 0, onEdit, onDelete, onView, onToggleActive, reloadData, getCategoryCount }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  
  // Tính toán trạng thái gốc từ Backend
  const parsedActive = category.active !== false && category.isActive !== false && category.status !== 0 && category.status !== 'INACTIVE';
  
  // State Ảo (Optimistic UI) để giao diện ĐỔI NGAY LẬP TỨC khi click!
  const [localActive, setLocalActive] = useState(parsedActive);

  // Đếm động thời gian thực bằng getCategoryCount truyền từ cha xuống (Chuẩn 100% khớp Khách)
  const totalCount = getCategoryCount ? getCategoryCount(category.id) : 0;

  // Đồng bộ lại nếu Backend thực sự trả về field trạng thái rõ ràng (không bị undefined)
  React.useEffect(() => {
     if ('active' in category || 'isActive' in category || 'status' in category) {
         setLocalActive(parsedActive);
     }
  }, [parsedActive, category]);

  const handleToggle = () => {
    setLocalActive(!localActive); // Đảo màu nút ngay tức khắc
    if (onToggleActive) onToggleActive(category.id);
  };

  return (
    <>
      <div className="table-row">
        <div className="col-name" style={{ paddingLeft: `${level * 30}px` }}>
          {hasChildren ? (
            <span className="tree-toggle" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
          ) : (
            <span className="tree-toggle-empty" style={{ width: 24, display: 'inline-block' }}></span>
          )}
          <span className={`cat-name ${level > 0 ? 'child-name' : 'parent-name'}`}>
            {category.name}
          </span>
        </div>
        <div className={`col-desc ${level > 0 ? 'child-desc' : ''}`}>
          {category.description || 'Chưa có mô tả...'}
        </div>
        <div className="col-status">
          <button 
            type="button"
            className={`status-tag ${localActive ? 'active' : 'inactive'}`}
            onClick={handleToggle}
          >
            {localActive ? 'Hoạt động' : 'Không hoạt động'}
          </button>
        </div>
        <div className="col-count">
          <span className="badge-count">
            {totalCount} MÓN
          </span>
        </div>
        <div className="col-action" style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onView(category)} title="Xem chi tiết" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f3f4f6', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Eye size={16} />
          </button>
          <button onClick={() => onEdit(category)} title="Chỉnh sửa" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fef3c7', color: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(category.id)} title="Xóa" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {expanded && hasChildren && category.children.map(child => (
        <CategoryRow 
          key={child.id} 
          category={child} 
          level={level + 1} 
          onEdit={onEdit} 
          onDelete={onDelete}
          onView={onView}
          onToggleActive={onToggleActive}
          reloadData={reloadData}
          getCategoryCount={getCategoryCount}
        />
      ))}
    </>
  );
};

export default CategoryRow;
