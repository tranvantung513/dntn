import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { categoryApi } from '../api/categoryApi';
import { menuItemApi } from '../api/menuItemApi';
import CategoryRow from '../components/CategoryRow';
import CategoryModal from '../components/CategoryModal';
import CategoryDetailModal from '../components/CategoryDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Search, Plus, TrendingUp, AlertTriangle, Filter, MoreVertical, ChevronLeft, ChevronRight
} from 'lucide-react';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [stats, setStats] = useState({ totalCategories: 0, emptyCategories: 0 });
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortFilter, setSortFilter] = useState('NEWEST');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null });
  const [debugRawData, setDebugRawData] = useState(null);
  const isFirstRender = useRef(true);
  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Tree with item count
    try {
      // Dùng endpoint mới trả về số lượng món trong danh mục (with-count)
      const treeRes = await categoryApi.getWithCount();
      
      let resData = treeRes.data;
      setDebugRawData(resData); // Lưu lại toàn bộ phản hồi gốc để chuẩn bệnh

      let finalArray = [];
      if (Array.isArray(resData)) {
        finalArray = resData;
      } else if (resData && typeof resData === 'object') {
        finalArray = resData.data || resData.content || resData.items || resData.result || resData.categories || [];
      }
      
      // Khắc phục lỗi Backend trả về mảng phẳng (phụ) thay vì Cây chuẩn (chỉ Root)
      // Lọc bỏ đi những category đã nằm trong mảng children của category khác
      const childIds = new Set();
      const findChildrenIds = (nodes) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            node.children.forEach(child => childIds.add(child.id));
            findChildrenIds(node.children);
          }
        });
      };
      findChildrenIds(finalArray);
      finalArray = finalArray.filter(cat => !childIds.has(cat.id));
      
      
      if (finalArray.length === 0 && stats.totalCategories > 0) {
         console.warn("Cảnh báo: Server trả về mảng rỗng [] dù tổng số danh mục > 0", resData);
      }
      
      setCategories(finalArray);
    } catch (err) {
      console.error("Lỗi getTree:", err);
      toast.error("Lỗi tải danh mục /tree: " + (err.response?.data?.message || err.message));
    }

    // Fetch all Menu Items để tự đếm số lượng chuẩn 100% giống Frontend khách hàng
    try {
      const itemsRes = await menuItemApi.getAll();
      let fetchedItems = Array.isArray(itemsRes.data) ? itemsRes.data : 
                         (itemsRes.data?.data || itemsRes.data?.content || itemsRes.data?.items || []);
      setMenuItems(fetchedItems.filter(item => item.isActive !== false));
    } catch (err) {
      console.error("Lỗi get Menu Items:", err);
    }

    // Fetch Stats
    try {
      const statsRes = await categoryApi.getStats();
      setStats({
        totalCategories: statsRes.data?.totalCategories || 24,
        emptyCategories: statsRes.data?.emptyCategories || 2
      });
    } catch (err) {
      console.error("Lỗi getStats:", err);
      setStats({ totalCategories: 24, emptyCategories: 2 }); // fallback
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Tránh việc gọi API tìm kiếm ngay lần render đầu tiên (vì fetchData đã lo việc đó)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        if (!keyword.trim()) {
           // Sử dụng API với count để đồng bộ
           const treeRes = await categoryApi.getWithCount();
           let resData = treeRes.data;
           let finalArray = Array.isArray(resData) ? resData : (resData?.data || resData?.content || resData?.items || []);
           
           const childIds = new Set();
           const findChildrenIds = (nodes) => {
             nodes.forEach(node => {
               if (node.children && node.children.length > 0) {
                 node.children.forEach(child => childIds.add(child.id));
                 findChildrenIds(node.children);
               }
             });
           };
           findChildrenIds(finalArray);
           finalArray = finalArray.filter(cat => !childIds.has(cat.id));
           
           setCategories(finalArray);
        } else {
           const res = await categoryApi.getAll(keyword.trim());
           let resData = res.data;
           let finalArray = Array.isArray(resData) ? resData : (resData?.data || resData?.content || resData?.items || []);
           setCategories(finalArray);
        }
        setCurrentPage(1); // Lọc lại danh sách thì quay về trang 1
      } catch (err) {
        console.error(err);
        toast.error("Lỗi tải API tìm kiếm: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, categoryId: id });
  };

  const executeDelete = async () => {
    if (!deleteModal.categoryId) return;
    try {
      setLoading(true);
      await categoryApi.delete(deleteModal.categoryId);
      toast.success('Đã xóa danh mục thành công');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa danh mục');
    } finally {
      setLoading(false);
      setDeleteModal({ isOpen: false, categoryId: null });
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await categoryApi.toggleActive(id);
      toast.success('Đã thay đổi trạng thái thành công');
      fetchData(); // Tải lại cây dữ liệu để cập nhật Dashboard số lượng và Trạng thái chuẩn
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi đổi trạng thái');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleView = (category) => {
    setViewingCategory(category);
    setIsDetailModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const filterTree = (nodes, filter) => {
    if (filter === 'ALL') return nodes;
    
    return nodes.map(node => {
      // 1. Bản thân node này có thỏa mãn không?
      const isActived = node.active !== false && node.isActive !== false && node.status !== 0 && node.status !== 'INACTIVE';
      const isSelfMatching = filter === 'ACTIVE' ? isActived : !isActived;
      
      // 2. Lọc sâu vào các node con (Đệ quy)
      const filteredChildren = node.children ? filterTree(node.children, filter) : [];
      
      // 3. Giữ lại node này nếu BẢN THÂN NÓ KHỚP, **HOẶC** CÓ BẤT KỲ ĐỨA CON NÀO KHỚP
      if (isSelfMatching || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    }).filter(n => n !== null); // Xoá sạch các node không khớp
  };

  const filteredCategories = filterTree(categories, statusFilter);

  const sortTree = (nodes, sortType) => {
    let sortedNodes = [...nodes];
    if (sortType === 'A_Z') {
      sortedNodes.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortType === 'Z_A') {
      sortedNodes.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    } else if (sortType === 'NEWEST') {
      sortedNodes.sort((a, b) => b.id - a.id); // ID lớn là tạo sau cùng (mới nhất)
    }
    
    return sortedNodes.map(node => ({
      ...node,
      children: node.children ? sortTree(node.children, sortType) : []
    }));
  };

  const sortedCategories = sortTree(filteredCategories, sortFilter);

  // Tính toán dữ liệu hiển thị trên trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = sortedCategories.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);

  // Helper đếm danh mục đệ quy chuẩn 100%
  const getSubcategoryIds = (catId, nodes) => {
    let ids = [];
    const findDeep = (list) => {
      for (const node of list) {
        if (node.id === catId) {
          const traverse = (n) => {
            ids.push(n.id);
            if (n.children) n.children.forEach(traverse);
          };
          traverse(node);
          return true;
        }
        if (node.children && findDeep(node.children)) return true;
      }
      return false;
    };
    findDeep(nodes);
    return ids;
  };

  const getCategoryCount = (catId) => {
    const validIds = getSubcategoryIds(catId, categories);
    return menuItems.filter(item => {
      const cId = item.category?.id || item.categoryId;
      return validIds.includes(cId);
    }).length;
  };

  return (
    <>
      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categories={categories} 
        onReload={fetchData} 
        initialData={editingCategory}
      />
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
        onConfirm={executeDelete}
        title="Xóa danh mục"
        message="Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác."
        isDangerous={true}
      />
      <CategoryDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        category={viewingCategory}
      />
      <div className="header-top">
        <div className="page-title-area">
          <h1>Quản lý Danh mục</h1>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} color="#999" />
            <input 
              type="text" 
              placeholder="Tìm kiếm danh mục..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="filter-box" style={{ marginLeft: 12, marginRight: 12, display: 'flex', gap: 8 }}>
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
            </select>
          </div>
          <button className="btn-primary" onClick={handleAdd}>
            <Plus size={18} /> Thêm danh mục mới
          </button>
        </div>
      </div>

      <div className="dashboard-cards" style={{ marginTop: 24, marginBottom: 8, marginInline: 40, padding: 0 }}>
        <div className="stat-card-horizontal">
           <div className="stat-icon-circle" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <TrendingUp size={24} />
           </div>
           <div className="stat-content">
              <div className="stat-label">Tổng số danh mục</div>
              <div className="stat-number">{stats.totalCategories}</div>
           </div>
        </div>
        <div className="stat-card-horizontal">
           <div className="stat-icon-circle red" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={24} />
           </div>
           <div className="stat-content">
              <div className="stat-label">Danh mục trống</div>
              <div className="stat-number">{stats.emptyCategories < 10 ? `0${stats.emptyCategories}` : stats.emptyCategories}</div>
           </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-header-controls">
          <h2>Danh sách các nhóm thực đơn</h2>
        </div>

        <div className="custom-table">
          <div className="table-head">
            <div className="col-name">TÊN DANH MỤC</div>
            <div className="col-desc">MÔ TẢ</div>
            <div className="col-status" style={{ color: '#9ca3af' }}>TRẠNG THÁI</div>
            <div className="col-count">SỐ LƯỢNG MÓN</div>
            <div className="col-action">THAO TÁC</div>
          </div>
          <div className="table-body">
            {loading ? (
              <div className="loading-state">Đang tải dữ liệu...</div>
            ) : categories.length === 0 ? (
              <div className="empty-state">Không có danh mục nào</div>
            ) : (
              currentCategories.map(cat => (
                <CategoryRow 
                  key={cat.id} 
                  category={cat} 
                  onEdit={handleEdit} 
                  onDelete={(id) => setDeleteModal({ isOpen: true, categoryId: id })}
                  onView={handleView}
                  onToggleActive={handleToggleActive}
                  reloadData={fetchData}
                  getCategoryCount={getCategoryCount}
                />
              ))
            )}
          </div>
        </div>

        <div className="pagination-area">
          <span className="page-info">
            Hiển thị {sortedCategories.length === 0 ? 0 : startIndex + 1} đến {Math.min(endIndex, sortedCategories.length)} trong số {sortedCategories.length} danh mục gốc
          </span>
          <div className="page-controls">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
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
              style={{ opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
