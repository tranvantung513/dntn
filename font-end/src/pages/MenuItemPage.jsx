import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { menuItemApi } from '../api/menuItemApi';
import { categoryApi } from '../api/categoryApi';
import MenuItemRow from '../components/MenuItemRow';
import MenuItemModal from '../components/MenuItemModal';
import MenuItemDetailModal from '../components/MenuItemDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import { Search, Plus, ChevronLeft, ChevronRight, Archive, Check } from 'lucide-react';

const MenuItemPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(false);
  
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortFilter, setSortFilter] = useState('NEWEST');
  const [categoryFilter, setCategoryFilter] = useState('ALL'); // ALL, hoặc categoryId
  
  const [stats, setStats] = useState({ total: 0, active: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null });
  const isFirstRender = useRef(true);
  const toast = useToast();

  const fetchDependencies = async () => {
    try {
      const res = await categoryApi.getTree();
      let resData = res.data;
      let finalArray = Array.isArray(resData) ? resData : (resData?.data || resData?.content || resData?.items || []);
      setCategories(finalArray);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await menuItemApi.getAll();
      let rawItems = res.data;
      if (!Array.isArray(rawItems)) {
        rawItems = rawItems?.data || rawItems?.content || rawItems?.items || rawItems?.result || [];
      }
      setItems(rawItems);
    } catch (err) {
      console.error("Lỗi tải món ăn", err);
      toast.error("Lỗi tải thực đơn: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await menuItemApi.getDashboardStats();
      // Handle Spring Boot generic API wrappers (e.g., res.data.data) or root objects
      const statsData = res.data?.data || res.data?.result || res.data;
      setStats({
        total: statsData?.total || 0,
        active: statsData?.active || 0
      });
    } catch (err) {
      console.error("Lỗi tải dashboard", err);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchItems();
    fetchStats();
  }, []);

  useEffect(() => {
     // Optional Server-side search debounce trigger
  }, [keyword]);

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, itemId: id });
  };

  const executeDelete = async () => {
    if (!deleteModal.itemId) return;
    try {
      setLoading(true);
      await menuItemApi.delete(deleteModal.itemId);
      toast.success('Đã xóa món ăn thành công');
      fetchItems();
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa món ăn');
    } finally {
      setLoading(false);
      setDeleteModal({ isOpen: false, itemId: null });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleView = (item) => {
    setViewingItem(item);
    setIsDetailModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const getSubcategoryIds = (targetId, nodes) => {
    let ids = [];
    const findNodeAndChildren = (currentNodes, found) => {
      for (const node of currentNodes) {
        if (found || node.id === targetId) {
          ids.push(node.id);
          if (node.children && node.children.length > 0) {
            findNodeAndChildren(node.children, true);
          }
        } else if (node.children && node.children.length > 0) {
          findNodeAndChildren(node.children, false);
        }
      }
    };
    findNodeAndChildren(nodes, false);
    return ids;
  };

  // Client-side filtering logic matching the requested specification
  let filteredItems = items.filter(item => {
    // 1. Search Filter
    if (keyword && !item.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    
    // 2. Status Filter
    const isActived = item.isActive !== false;
    if (statusFilter === 'ACTIVE' && !isActived) return false;
    if (statusFilter === 'INACTIVE' && isActived) return false;

    // 3. Category Filter
    if (categoryFilter !== 'ALL') {
      const validIds = getSubcategoryIds(categoryFilter, categories);
      if (!validIds.includes(item.category?.id)) return false;
    }

    return true;
  });

  // Client-side Sort
  if (sortFilter === 'A_Z') {
    filteredItems.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  } else if (sortFilter === 'Z_A') {
    filteredItems.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
  } else if (sortFilter === 'NEWEST') {
    filteredItems.sort((a, b) => {
      // Dùng createdAt nếu có, không thì xếp theo ID
      if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
      return (b.id?.toString() || b.id).localeCompare(a.id?.toString() || a.id);
    });
  } else if (sortFilter === 'FEATURED') {
    filteredItems.sort((a, b) => {
      const aFeature = a.isFeatured === true || a.featured === true ? 1 : 0;
      const bFeature = b.isFeatured === true || b.featured === true ? 1 : 0;
      return bFeature - aFeature;
    });
  }

  // Phân trang
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Hàm đệ quy để trải phẳng cấu trúc cây danh mục
  const flattenCategories = (cats) => {
    let result = [];
    cats.forEach(c => {
      result.push(c);
      if (c.children && c.children.length > 0) {
        result = result.concat(flattenCategories(c.children));
      }
    });
    return result;
  };

  // Lấy ra danh sách các Category để làm Filter ngang (Pills)
  const topCategories = flattenCategories(categories); // Kéo thả ngang nếu có nhiều danh mục

  return (
    <>
      <MenuItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categories={categories} 
        onReload={() => { fetchItems(); fetchStats(); }} 
        initialData={editingItem}
      />
      <MenuItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        item={viewingItem}
      />
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, itemId: null })}
        onConfirm={executeDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa món ăn này không?"
        isDangerous={true}
      />
      <div className="header-top">
        <div className="page-title-area" style={{ width: 250 }}>
          <h1 style={{fontSize: 24, fontWeight: '700'}}>Quản lý thực đơn</h1>
        </div>
        <div className="header-actions flex-wrap gap-2">
          <div className="search-box">
            <Search size={16} color="#999" />
            <input 
              type="text" 
              placeholder="Tìm kiếm món..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ padding: '8px', border: 'none', outline: 'none', background: 'transparent' }}
            />
          </div>
          <div className="filter-box" style={{ display: 'flex', gap: 8 }}>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="ui-select"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
            </select>
            <select 
              value={sortFilter} 
              onChange={e => setSortFilter(e.target.value)}
              className="ui-select"
            >
              <option value="NEWEST">Mới nhất</option>
              <option value="A_Z">Sắp xếp A - Z</option>
              <option value="Z_A">Sắp xếp Z - A</option>
              <option value="FEATURED">Nổi bật</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleAdd}>
            <Plus size={16} /> Thêm món mới
          </button>
        </div>
      </div>

      <div className="dashboard-cards" style={{ marginTop: 24, marginBottom: 8, marginInline: 40, padding: 0 }}>
        <div className="stat-card-horizontal">
           <div className="stat-icon-circle orange">
              <Archive size={24} />
           </div>
           <div className="stat-content">
              <div className="stat-label">Tổng sản phẩm</div>
              <div className="stat-number">{stats.total} <span>món</span></div>
           </div>
        </div>
        <div className="stat-card-horizontal">
           <div className="stat-icon-circle green" style={{ borderRadius: '50%', background: '#d1fae5', color: '#10b981' }}>
              <Check size={32} strokeWidth={3} />
           </div>
           <div className="stat-content">
              <div className="stat-label">Đang kinh doanh</div>
              <div className="stat-number">{stats.active} <span>món</span></div>
           </div>
        </div>
      </div>

      <div style={{ display: 'flex', margin: '8px 72px 0 72px', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ paddingTop: '8px', flexShrink: 0 }}>
          <button 
             className={`cat-pill-btn ${categoryFilter === 'ALL' ? 'active' : ''}`}
             onClick={() => { setCategoryFilter('ALL'); setCurrentPage(1); }}
          >
            Tất cả món
          </button>
        </div>
        
        <div className="category-pills" style={{ flex: 1, padding: '8px 0', paddingBottom: '12px', margin: 0 }}>
          {topCategories.map(cat => (
             <button 
               key={cat.id}
               className={`cat-pill-btn ${categoryFilter === cat.id ? 'active' : ''}`}
               onClick={() => { setCategoryFilter(cat.id); setCurrentPage(1); }}
             >
               {cat.name}
             </button>
          ))}
        </div>
      </div>

      <div className="card table-card" style={{ marginTop: 24 }}>
        <div className="custom-table">
          <div className="table-head product-head">
            <div className="col-img">HÌNH ẢNH</div>
            <div className="col-name">TÊN MÓN</div>
            <div className="col-cat">DANH MỤC</div>
            <div className="col-price">GIÁ</div>
            <div className="col-quantity">SỐ LƯỢNG</div>
            <div className="col-status">TRẠNG THÁI</div>
            <div className="col-feature" style={{width: '90px', textAlign: 'center'}}>NỔI BẬT</div>
            <div className="col-action" style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '15px' }}>HÀNH ĐỘNG</div>
          </div>
          <div className="table-body">
            {loading ? (
              <div className="loading-state">Đang tải dữ liệu...</div>
            ) : filteredItems.length === 0 ? (
              <div className="empty-state">Không có món ăn nào hiển thị</div>
            ) : (
              currentItems.map(item => (
                <MenuItemRow 
                  key={item.id} 
                  item={item} 
                  onEdit={handleEdit} 
                  onDelete={handleDeleteClick}
                  onView={handleView}
                  onStatusChange={fetchStats}
                />
              ))
            )}
          </div>
        </div>

        <div className="pagination-area">
          <span className="page-info" style={{ color: '#9ca3af', fontSize: 13 }}>
            Hiển thị từ {filteredItems.length === 0 ? 0 : startIndex + 1} đến {Math.min(endIndex, filteredItems.length)} trên tổng số {filteredItems.length} món
          </span>
          <div className="page-controls">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{ opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuItemPage;
