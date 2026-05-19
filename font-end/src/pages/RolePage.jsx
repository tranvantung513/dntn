import React, { useState, useEffect } from 'react';
import { Shield, Users, Lock, Edit2, Trash2, Plus, Eye, Key, Search, X, CheckCircle2, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { roleApi } from '../api/roleApi';
import { userApi } from '../api/userApi';
import { useToast } from '../contexts/ToastContext';
import './ReservationPage.css'; // Sử dụng chung giao diện chuẩn từ Đặt bàn

const RolePage = () => {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [userCounts, setUserCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Pagination Modal/Form States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await roleApi.getAll();
      let dataList = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.content || []);
      setRoles(dataList);
      
      try {
        const userRes = await userApi.getAll();
        const users = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || userRes.data?.content || userRes.data || []);
        const countsConfig = {};
        users.forEach(u => {
          let code = null;
          if (u.role && typeof u.role === 'object') code = u.role.code;
          else if (u.role) code = u.role;
          else if (Array.isArray(u.roles) && u.roles.length > 0) {
            const adminRole = u.roles.find(r => (typeof r === 'object' ? r.code : r) === 'ROLE_ADMIN');
            const primary = adminRole || u.roles[0];
            code = typeof primary === 'object' ? primary.code : primary;
          }
          if (code) {
             countsConfig[code] = (countsConfig[code] || 0) + 1;
          }
        });
        setUserCounts(countsConfig);
      } catch (e) {
        console.error("Fetch user counts error:", e);
      }

    } catch (err) {
      toast.error('Lỗi khi tải danh sách quyền: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        code: role.code || '',
        name: role.name || '',
        description: role.description || '',
        isActive: role.isActive !== false
      });
    } else {
      setEditingRole(null);
      setFormData({ code: '', name: '', description: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error('Vui lòng nhập Mã quyền và Tên quyền!');
      return;
    }

    try {
      if (editingRole) {
        await roleApi.update(editingRole.id, formData);
        toast.success('Đã cập nhật Nhóm quyền thành công!');
        
        // Cập nhật trạng thái
        if (formData.isActive && editingRole.isActive === false) await roleApi.enable(editingRole.id);
        if (!formData.isActive && editingRole.isActive !== false) await roleApi.disable(editingRole.id);
        
      } else {
        await roleApi.create(formData);
        toast.success('Tạo Nhóm quyền thành công!');
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (err) {
      toast.error('Lỗi xử lý hệ thống: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (role) => {
    const isAdmin = role.code === 'ROLE_ADMIN' || role.code === 'ADMIN';
    if (isAdmin) {
      toast.error('Không thể thay đổi trạng thái của nhóm quyền Quản trị viên cấp cao!');
      return;
    }
    try {
      if (role.isActive !== false) {
        await roleApi.disable(role.id);
        toast.success('Đã Vô hiệu hóa quyền này');
        setRoles(prev => prev.map(r => r.id === role.id ? { ...r, isActive: false } : r));
      } else {
        await roleApi.enable(role.id);
        toast.success('Đã Kích hoạt quyền này');
        setRoles(prev => prev.map(r => r.id === role.id ? { ...r, isActive: true } : r));
      }
    } catch (err) {
      toast.error('Lỗi đổi trạng thái: ' + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  const handleDeleteTrigger = (role) => {
    setEditingRole(role);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!editingRole) return;
    try {
      await roleApi.delete(editingRole.id);
      toast.success('Đã xóa Nhóm quyền vĩnh viễn!');
      setIsDeleteModalOpen(false);
      fetchRoles();
    } catch (err) {
      toast.error('Không thể xóa. Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Pagination & Filtering Logic
  const filteredRoles = roles.filter(r => {
    const matchSearch = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                      (r.code || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchTab = activeTab === 'ALL' ? true : 
                     activeTab === 'ACTIVE' ? r.isActive !== false :
                     activeTab === 'INACTIVE' ? r.isActive === false : true;
    return matchSearch && matchTab;
  });
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage) || 1;

  const activeStatsCount = roles.filter(r => r.isActive !== false).length;
  const inactiveStatsCount = roles.length - activeStatsCount;

  return (
    <>
      {/* HEADER TOP */}
      <div className="header-top">
        <div className="page-title-area">
          <h1>Quản lý Nhóm quyền</h1>
        </div>
        <div className="header-actions">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhóm quyền..." 
              value={searchQuery}
              onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setCurrentPage(1);
              }}
            />
          </div>
          <button className="btn-primary inline-flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', fontWeight: '600' }} onClick={() => handleOpenModal()}>
            <Plus size={18} />
            Thêm nhóm quyền
          </button>
        </div>
      </div>

      <div className="reservation-page" style={{ padding: '0 40px 40px', marginTop: '32px' }}>
      
        {/* STATS */}
        <div className="dashboard-cards" style={{ marginTop: 0, marginBottom: 24, padding: 0 }}>
          <div className="stat-card-horizontal">
            <div className="stat-icon-circle orange" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <ShieldCheck size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Tổng số nhóm</div>
              <div className="stat-number">{roles.length}</div>
            </div>
          </div>
          <div className="stat-card-horizontal">
            <div className="stat-icon-circle green" style={{ background: '#d1fae5', color: '#10b981' }}>
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Đang hoạt động</div>
              <div className="stat-number">{activeStatsCount}</div>
            </div>
          </div>
          <div className="stat-card-horizontal">
            <div className="stat-icon-circle red" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <Lock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Đã vô hiệu hóa</div>
              <div className="stat-number">{inactiveStatsCount}</div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="table-section">
          <div className="table-tabs-header">
            <div className="tabs-list">
              <button className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => { setActiveTab('ALL'); setCurrentPage(1); }}>Tất cả</button>
              <button className={`tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`} onClick={() => { setActiveTab('ACTIVE'); setCurrentPage(1); }}>Đang hoạt động</button>
              <button className={`tab-btn ${activeTab === 'INACTIVE' ? 'active' : ''}`} onClick={() => { setActiveTab('INACTIVE'); setCurrentPage(1); }}>Đã vô hiệu hóa</button>
            </div>
          </div>

          <table className="reservation-table">
            <thead>
              <tr>
                <th>TÊN NHÓM QUYỀN</th>
                <th>MÔ TẢ</th>
                <th style={{ textAlign: 'center' }}>SỐ TÀI KHOẢN</th>
                <th>TRẠNG THÁI</th>
                <th style={{ textAlign: 'right' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</td></tr>
              ) : currentRoles.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Không tìm thấy nhóm quyền phù hợp.</td></tr>
              ) : (
                currentRoles.map(role => {
                  const isActive = role.isActive !== false;
                  return (
                    <tr key={role.id}>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar" style={{ background: isActive ? '#fef3c7' : '#f1f5f9', color: isActive ? '#d97706' : '#64748b' }}>
                            {isActive ? <Shield size={20} /> : <Lock size={20} />}
                          </div>
                          <div className="customer-info-detail">
                            <span className="customer-name">{role.name || role.code}</span>
                            <span className="customer-phone">{role.code}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                         <div style={{ fontSize: '13px', color: '#374151', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {role.description || 'Chưa cung cấp mô tả chi tiết'}
                         </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="people-count">{userCounts[role.code] || 0}</span>
                      </td>
                      <td>
                        <span 
                          className={`status-pill ${isActive ? 'status-confirmed' : 'status-cancelled'}`} 
                          onClick={() => handleToggleStatus(role)}
                          style={{ cursor: (role.code === 'ROLE_ADMIN' || role.code === 'ADMIN') ? 'not-allowed' : 'pointer', opacity: (role.code === 'ROLE_ADMIN' || role.code === 'ADMIN') ? 0.7 : 1 }}
                          title={(role.code === 'ROLE_ADMIN' || role.code === 'ADMIN') ? "Quyền Quản trị viên cấp cao không thể thay đổi" : "Bấm để đổi trạng thái"}
                        >
                          {isActive ? 'HOẠT ĐỘNG' : 'KHÔNG HOẠT ĐỘNG'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                          <button className="res-cancel-icon-btn" title="Xem chi tiết" onClick={() => { setViewingRole(role); setIsDetailModalOpen(true); }}>
                            <Eye size={16} />
                          </button>
                          <button className="res-cancel-icon-btn" title="Chỉnh sửa" onClick={() => handleOpenModal(role)}>
                            <Edit2 size={16} />
                          </button>
                          {!(role.code === 'ROLE_ADMIN' || role.code === 'ADMIN') && (
                            <button className="res-cancel-icon-btn" title="Xóa" onClick={() => handleDeleteTrigger(role)}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination">
            <div className="pagination-text">
              Hiển thị {filteredRoles.length === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, filteredRoles.length)} trong {filteredRoles.length} kết quả
            </div>
            <div className="pagination-controls">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                 <button 
                   key={num} 
                   className={`page-btn ${currentPage === num ? 'active' : ''}`}
                   onClick={() => setCurrentPage(num)}
                 >
                   {num}
                 </button>
              ))}
              <button className="page-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* CREATE / EDIT MODAL (Re-using Reservation Form Style) */}
        {isModalOpen && (
          <div className="res-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="res-modal-content" onClick={e => e.stopPropagation()}>
              <div className="res-modal-header">
                <h2>{editingRole ? 'Chỉnh sửa Nhóm quyền' : 'Thêm Nhóm quyền mới'}</h2>
                <button className="res-close-btn" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="res-modal-body">
                  <div className="res-form-group">
                    <label>Mã quyền (vd: ADMIN, STAFF) *</label>
                    <input 
                      type="text" 
                      className="res-form-control" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                      placeholder="Nhập mã định danh..."
                      required
                    />
                  </div>
                  <div className="res-form-group">
                    <label>Tên hiển thị *</label>
                    <input 
                      type="text" 
                      className="res-form-control" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="Nhập tên gọi quyền..."
                      required
                    />
                  </div>
                  <div className="res-form-group">
                    <label>Mô tả chi tiết</label>
                    <textarea 
                      className="res-form-control" 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="Diễn giải vai trò của quyền này..."
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="res-form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      id="chkActive"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }}
                    />
                    <label htmlFor="chkActive" style={{ margin: 0, cursor: 'pointer' }}>Cho phép hoạt động ngay</label>
                  </div>
                </div>
                <div className="res-modal-footer">
                  <button type="button" className="res-btn-secondary" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                  <button type="submit" className="res-btn-primary">Lưu Nhóm Quyền</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {isDeleteModalOpen && editingRole && (
          <div className="res-modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
            <div className="res-modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
              <div className="res-modal-header">
                <h2 style={{ color: '#ef4444' }}>Xác nhận Xóa</h2>
                <button className="res-close-btn" onClick={() => setIsDeleteModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="res-modal-body">
                <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5 }}>
                  Bạn chuẩn bị xóa Nhóm quyền <strong>{editingRole.name}</strong>. Hành động này sẽ không thể khôi phục lại.
                </p>
              </div>
              <div className="res-modal-footer">
                <button type="button" className="res-btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Quay lại</button>
                <button type="button" className="res-btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={confirmDelete}>
                  Đồng ý Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW DETAIL MODAL */}
        {isDetailModalOpen && viewingRole && (
          <div className="res-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
            <div className="res-modal-content" onClick={e => e.stopPropagation()}>
              <div className="res-modal-header">
                <h2>Chi tiết quyền: {viewingRole.name}</h2>
                <button className="res-close-btn" onClick={() => setIsDetailModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="res-modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>MÃ QUYỀN (CODE)</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{viewingRole.code}</div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>TÊN HIỂN THỊ</div>
                    <div style={{ fontSize: '15px', color: '#1e293b' }}>{viewingRole.name}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>MÔ TẢ CHI TIẾT</div>
                    <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>{viewingRole.description || 'Không có mô tả'}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>TRẠNG THÁI</div>
                    <span className={`status-pill ${viewingRole.isActive !== false ? 'status-confirmed' : 'status-cancelled'}`}>
                      {viewingRole.isActive !== false ? 'HOẠT ĐỘNG' : 'KHÔNG HOẠT ĐỘNG'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="res-modal-footer" style={{ justifyContent: 'center' }}>
                <button type="button" className="res-btn-primary" onClick={() => setIsDetailModalOpen(false)} style={{ width: '100%' }}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default RolePage;
