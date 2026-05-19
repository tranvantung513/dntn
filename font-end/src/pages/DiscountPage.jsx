import React, { useState, useEffect } from 'react';
import { 
  Plus, LayoutGrid, CheckCircle, History, Filter, Edit2, Trash2, X, Eye, Search
} from 'lucide-react';
import { discountApi } from '../api/discountApi';
import { useToast } from '../contexts/ToastContext';
import './DiscountPage.css';

const DiscountPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDiscount, setViewingDiscount] = useState(null);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);
  const [formData, setFormData] = useState(initialFormState());
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 5;
  const toast = useToast();

  function initialFormState() {
    return {
      code: '',
      name: '',
      description: '',
      discountType: 0,
      discountValue: '',
      minOrderValue: 0,
      maxDiscount: 0,
      startDate: new Date().toISOString().substring(0, 16),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
      status: true
    };
  }

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await discountApi.getAll();
      const fetched = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      // Lọc bỏ các mã giảm giá đã bị xóa mềm (isDeleted === true)
      setDiscounts(fetched.filter(d => !d.isDeleted));
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Lỗi khi tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const openAddModal = () => {
    setEditingDiscount(null);
    setFormData(initialFormState());
    setIsModalOpen(true);
  };

  const openEditModal = (d) => {
    setEditingDiscount(d);
    setFormData({
      code: d.code || '',
      name: d.name || '',
      description: d.description || '',
      discountType: d.discountType || 0,
      discountValue: d.discountValue || '',
      minOrderValue: d.minOrderValue || 0,
      maxDiscount: d.maxDiscount || 0,
      startDate: d.startDate ? d.startDate.substring(0, 16) : '',
      endDate: d.endDate ? d.endDate.substring(0, 16) : '',
      status: d.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (d) => {
    setDiscountToDelete(d);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!discountToDelete) return;
    try {
      await discountApi.delete(discountToDelete.id);
      toast.success("Xóa mã giảm giá thành công");
      setIsDeleteModalOpen(false);
      setDiscountToDelete(null);
      fetchDiscounts();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa");
      setIsDeleteModalOpen(false);
    }
  };

  const handleToggleStatus = async (d) => {
    try {
      // Rebuild a clean payload to ensure backend processes it correctly
      const payload = {
        code: d.code,
        name: d.name,
        description: d.description,
        discountType: Number(d.discountType),
        discountValue: Number(d.discountValue),
        minOrderValue: Number(d.minOrderValue || 0),
        maxDiscount: Number(d.maxDiscount || 0),
        startDate: d.startDate,
        endDate: d.endDate,
        status: !d.status
      };
      
      if (payload.startDate && payload.startDate.length === 16) payload.startDate += ':00';
      if (payload.endDate && payload.endDate.length === 16) payload.endDate += ':00';

      // Cập nhật giao diện mượt mà trước (Optimistic UI update)
      setDiscounts(prev => prev.map(item => item.id === d.id ? { ...item, status: payload.status } : item));

      await discountApi.update(d.id, payload);
      toast.success(payload.status ? "Đã BẬT chiến dịch thành công" : "Đã TẮT chiến dịch thành công");
      
      fetchDiscounts();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật trạng thái");
      // Revert in case of failure
      fetchDiscounts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      payload.discountType = Number(payload.discountType);
      payload.discountValue = Number(payload.discountValue);
      payload.minOrderValue = Number(payload.minOrderValue || 0);
      payload.maxDiscount = Number(payload.maxDiscount || 0);
      
      if (payload.startDate && payload.startDate.length === 16) payload.startDate += ':00';
      if (payload.endDate && payload.endDate.length === 16) payload.endDate += ':00';

      if (editingDiscount) {
        console.log("SENDING UPDATE PAYLOAD:", payload);
        await discountApi.update(editingDiscount.id, payload);
        toast.success("Cập nhật mã thành công");
      } else {
        console.log("SENDING CREATE PAYLOAD:", payload);
        await discountApi.create(payload);
        toast.success("Tạo mã mới thành công");
      }
      setIsModalOpen(false);
      fetchDiscounts();
    } catch (error) {
      console.error("API SUBMIT ERROR:", error.response || error);
      let msg = error.response?.data?.message || error.response?.data?.error || "Lỗi khi lưu dữ liệu";
      
      // Bắt lỗi trùng Mã (Code) từ Database để hiển thị thân thiện
      if (typeof msg === 'string' && (msg.toLowerCase().includes("duplicate key") || msg.toLowerCase().includes("unique constraint") || msg.includes("uk_"))) {
        msg = "Mã (Code) này đã tồn tại trong hệ thống. Vui lòng nhập mã khác!";
      }
      
      toast.error(msg);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      let nextValue = type === 'checkbox' ? checked : value;
      let nextState = { ...prev, [name]: nextValue };
      
      if (name === 'discountType' && Number(nextValue) === 1) {
        nextState.maxDiscount = 0;
      }
      
      return nextState;
    });
  };

  // Stats
  const activeDiscounts = discounts.filter(d => d.status && new Date(d.endDate) >= new Date()).length;
  const expiredDiscounts = discounts.filter(d => new Date(d.endDate) < new Date()).length;

  // Lọc theo trạng thái và tên
  const filteredDiscounts = discounts.filter(d => {
    // Lọc theo tìm kiếm
    const matchSearch = (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (d.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    if (statusFilter === 'ALL') return true;
    const isActive = d.status && new Date(d.endDate) >= new Date();
    if (statusFilter === 'ACTIVE') return isActive;
    if (statusFilter === 'INACTIVE') return !isActive;
    return true;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredDiscounts.length / ITEMS_PER_PAGE) || 1;
  const currentDiscounts = filteredDiscounts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + 'đ';
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <>
      <div className="header-top">
        <div className="page-title-area">
          <h1>Quản lý Chương trình Khuyến mãi</h1>
        </div>
        <div className="header-actions flex-wrap gap-2" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="search-box">
            <Search size={16} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mã..." 
              style={{ width: '220px' }} 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="filter-box">
            <select 
              className="ui-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
            </select>
          </div>
          <button className="btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Tạo chiến dịch mới
          </button>
        </div>
      </div>

      <div className="discount-content" style={{ padding: '0 40px 40px' }}>
        <div className="dashboard-cards" style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div className="stat-card-horizontal">
             <div className="stat-icon-circle orange">
                <LayoutGrid size={24} />
             </div>
             <div className="stat-content">
                <div className="stat-label">Tổng chiến dịch</div>
                <div className="stat-number">{discounts.length} <span>chiến dịch</span></div>
             </div>
          </div>
          <div className="stat-card-horizontal">
             <div className="stat-icon-circle green" style={{ borderRadius: '50%', background: '#d1fae5', color: '#10b981' }}>
                <CheckCircle size={24} strokeWidth={3} />
             </div>
             <div className="stat-content">
                <div className="stat-label">Đang hoạt động</div>
                <div className="stat-number">{activeDiscounts} <span>chiến dịch</span></div>
             </div>
          </div>
          <div className="stat-card-horizontal">
             <div className="stat-icon-circle red" style={{ borderRadius: '50%', background: '#fee2e2', color: '#ef4444' }}>
                <History size={24} strokeWidth={3} />
             </div>
             <div className="stat-content">
                <div className="stat-label">Đã hết hạn</div>
                <div className="stat-number">{expiredDiscounts} <span>chiến dịch</span></div>
             </div>
          </div>
        </div>

      <div className="discount-list-container">
        <div className="list-header">
          <h2>Danh sách mã giảm giá</h2>
          <div className="header-actions">
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="discount-table">
            <thead>
              <tr>
                <th>MÃ (CODE)</th>
                <th>TÊN CHIẾN DỊCH</th>
                <th>LOẠI</th>
                <th>GIÁ TRỊ</th>
                <th>ĐƠN TỐI THIỂU</th>
                <th>THỜI HẠN</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {currentDiscounts.length === 0 ? (
                <tr><td colSpan="8" style={{textAlign: 'center'}}>Chưa có dữ liệu.</td></tr>
              ) : (
                currentDiscounts.map((d, index) => {
                  const isActive = d.status;
                  const isExpired = new Date(d.endDate) < new Date();
                  const showInactive = !isActive || isExpired;
                  
                  return (
                    <tr key={index}>
                      <td>
                        <div className={`code-pill ${showInactive ? 'inactive' : ''}`}>{d.code}</div>
                      </td>
                      <td>
                        <div className="campaign-info">
                          <span className="campaign-name">{d.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="type-text">{d.discountType === 0 ? 'Phần trăm' : 'Số tiền'}</span>
                      </td>
                      <td>
                        <span className="value-text">
                          {d.discountType === 0 ? `${d.discountValue}%` : formatCurrency(d.discountValue)}
                        </span>
                      </td>
                      <td><span className="type-text">{formatCurrency(d.minOrderValue)}</span></td>
                      <td>
                        <div className="date-text range">
                          <span>{formatDate(d.startDate)}</span>
                          <span className="to">đến {formatDate(d.endDate)}</span>
                          {isExpired && <span className="to" style={{ color: '#ef4444' }}>(Đã kết thúc)</span>}
                        </div>
                      </td>
                      <td>
                        <div 
                          className={`status-pill ${isActive ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleStatus(d)}
                        >
                          {isActive ? 'HOẠT ĐỘNG' : 'KHÔNG HOẠT ĐỘNG'}
                        </div>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="action-btn" onClick={() => setViewingDiscount(d)}><Eye size={18} /></button>
                          <button className="action-btn" onClick={() => openEditModal(d)}><Edit2 size={18} /></button>
                          <button className="action-btn delete" onClick={() => handleDelete(d)}><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          </div>
        )}

        <div className="list-footer">
          <div className="showing-text">
            Hiển thị {filteredDiscounts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredDiscounts.length)} trên {filteredDiscounts.length} kết quả
          </div>
          <div className="pagination">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              &lsaquo;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </div>
      
      </div> {/* END discount-content */}

      {viewingDiscount && (
        <div className="discount-modal-overlay">
          <div className="discount-modal" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>Chi tiết chiến dịch khuyến mãi</h2>
              <button className="close-btn" onClick={() => setViewingDiscount(null)}><X size={20} /></button>
            </div>
            
            <div className="detail-view">
              <div className="detail-row">
                <div className="detail-col">
                  <div className="detail-label">Mã (Code)</div>
                  <div className="detail-val" style={{ display: 'inline-block' }}>
                    <span className="code-pill">{viewingDiscount.code}</span>
                  </div>
                </div>
                <div className="detail-col">
                  <div className="detail-label">Tên chiến dịch</div>
                  <div className="detail-val" style={{ fontWeight: 'bold' }}>{viewingDiscount.name}</div>
                </div>
              </div>
              {viewingDiscount.description && (
                <div className="detail-row">
                  <div className="detail-col full">
                    <div className="detail-label">Mô tả</div>
                    <div className="detail-val">{viewingDiscount.description}</div>
                  </div>
                </div>
              )}
              <div className="detail-row">
                <div className="detail-col">
                  <div className="detail-label">Giá trị giảm</div>
                  <div className="detail-val" style={{ fontWeight: 'bold', color: '#111827', fontSize: '18px' }}>
                    {viewingDiscount.discountType === 0 
                      ? `${viewingDiscount.discountValue}%` 
                      : formatCurrency(viewingDiscount.discountValue)}
                    {viewingDiscount.discountType === 0 && Number(viewingDiscount.maxDiscount) > 0 && (
                      <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600', marginTop: '4px' }}>
                        (Giảm tối đa: {formatCurrency(viewingDiscount.maxDiscount)})
                      </div>
                    )}
                  </div>
                </div>
                <div className="detail-col">
                  <div className="detail-label">Đơn tối thiểu</div>
                  <div className="detail-val">{formatCurrency(viewingDiscount.minOrderValue)}</div>
                </div>
              </div>
              <div className="detail-row">
                <div className="detail-col">
                  <div className="detail-label">Thời hạn áp dụng</div>
                  <div className="detail-val" style={{ color: '#6b7280' }}>
                    Từ {formatDate(viewingDiscount.startDate)}<br/>
                    đến {formatDate(viewingDiscount.endDate)}
                  </div>
                </div>
                <div className="detail-col">
                  <div className="detail-label">Trạng thái</div>
                  <div className="detail-val">
                    <span className={`status-pill ${viewingDiscount.status ? 'active' : 'inactive'}`} style={{ cursor: 'default' }}>
                      {viewingDiscount.status ? 'HOẠT ĐỘNG' : 'KHÔNG HOẠT ĐỘNG'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setViewingDiscount(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="discount-modal-overlay">
          <div className="discount-modal">
            <div className="modal-header">
              <h2>{editingDiscount ? 'Cập nhật khuyến mãi' : 'Tạo chiến dịch mới'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Mã (Code)</label>
                  <input type="text" className="form-control" name="code" value={formData.code} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Tên chiến dịch</label>
                  <input type="text" className="form-control" name="name" value={formData.name} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <input type="text" className="form-control" name="description" value={formData.description} onChange={handleFormChange} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loại giảm giá</label>
                  <select className="form-control" name="discountType" value={formData.discountType} onChange={handleFormChange}>
                    <option value={0}>Phần trăm (%)</option>
                    <option value={1}>Số tiền (VNĐ)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá trị giảm</label>
                  <input type="number" className="form-control" name="discountValue" value={formData.discountValue} onChange={handleFormChange} required min="0" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Đơn tối thiểu</label>
                  <input type="number" className="form-control" name="minOrderValue" value={formData.minOrderValue} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Giảm tối đa (nếu %)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="maxDiscount" 
                    value={formData.maxDiscount} 
                    onChange={handleFormChange} 
                    disabled={Number(formData.discountType) === 1}
                    style={{ backgroundColor: Number(formData.discountType) === 1 ? '#f3f4f6' : 'white', cursor: Number(formData.discountType) === 1 ? 'not-allowed' : 'text' }}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian bắt đầu</label>
                  <input type="datetime-local" className="form-control" name="startDate" value={formData.startDate} onChange={handleFormChange} required />
                </div>
                <div className="form-group">
                  <label>Thời gian kết thúc</label>
                  <input type="datetime-local" className="form-control" name="endDate" value={formData.endDate} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="status" name="status" checked={formData.status} onChange={handleFormChange} />
                <label htmlFor="status" style={{ margin: 0, cursor: 'pointer' }}>Kích hoạt (Active)</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-primary">{editingDiscount ? 'Lưu thay đổi' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="discount-modal-overlay" style={{ zIndex: 1000 }}>
          <div className="discount-modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ background: '#fee2e2', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span style={{ color: '#ef4444', fontSize: 32, fontWeight: 'bold' }}>!</span>
              </div>
              <h2 style={{ margin: 0, fontSize: 20, color: '#111827' }}>Xác nhận xóa</h2>
              <p style={{ marginTop: 12, color: '#4b5563', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa mã giảm giá <strong style={{color: '#111827'}}>{discountToDelete?.code}</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '10px 24px' }}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDiscountToDelete(null);
                }}
              >
                Hủy
              </button>
              <button 
                className="btn-primary" 
                style={{ background: '#ef4444', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                onClick={confirmDelete}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiscountPage;
