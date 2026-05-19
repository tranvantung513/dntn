import React, { useState, useEffect, useRef } from 'react';
import { userApi } from '../api/userApi';
import { roleApi } from '../api/roleApi';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Search, Plus, TrendingUp, AlertTriangle, Edit2, Trash2, ChevronLeft, ChevronRight, CheckCircle, XCircle, Eye, EyeOff, Users
} from 'lucide-react';
import './UserPage.css'; // Mặc dù trống, cứ giữ lại để tránh lỗi import null nếu cần

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, lockedUsers: 0 });
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortFilter, setSortFilter] = useState('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const isFirstRender = useRef(true);
  const toast = useToast();

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
  const [allRoles, setAllRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [detailModalUser, setDetailModalUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', gender: '', status: 'ACTIVE', dateOfBirth: '', passwordHash: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAll();
      const userList = res.data?.data || res.data?.content || res.data || [];
      const array = Array.isArray(userList) ? userList : [];
      console.log("🎯 [DEBUG] Dữ liệu Backend trả về cho danh sách User:", array);
      setUsers(array);
      
      // Calculate Stats Locally since generic stats API might not match
      const totalUsers = array.length;
      const activeUsers = array.filter(u => u.status === 'ACTIVE').length;
      const lockedUsers = totalUsers - activeUsers;
      setStats({ totalUsers, activeUsers, lockedUsers });

      if (allRoles.length === 0) {
         try {
           const roleRes = await roleApi.getAll();
           const roleList = roleRes.data?.data || roleRes.data?.content || roleRes.data || [];
           setAllRoles(roleList);
         } catch(e) { console.error("Lỗi fetch roles:", e); }
      }

    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error("Lỗi khi tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const timeoutId = setTimeout(() => {
      // Local Filter + Sort instead of API request if API search isn't robust
      let result = [...users];
      
      // 1. Search
      if (keyword.trim()) {
        const kw = keyword.toLowerCase();
        result = result.filter(u => 
          u.fullName?.toLowerCase().includes(kw) || 
          u.email?.toLowerCase().includes(kw) || 
          u.phone?.toLowerCase().includes(kw)
        );
      }
      
      // 2. Status Filter
      if (statusFilter !== 'ALL') {
        result = result.filter(u => u.status === statusFilter);
      }
      
      // 2.5. Role Filter
      if (roleFilter !== 'ALL') {
        result = result.filter(u => {
           let roleCode = null;
           if (u.role) {
             roleCode = typeof u.role === 'object' ? u.role.code : u.role;
           } else if (Array.isArray(u.roles) && u.roles.length > 0) {
             const adminRole = u.roles.find(r => (typeof r === 'object' ? r.code : r) === 'ROLE_ADMIN');
             const primary = adminRole || u.roles[0];
             roleCode = typeof primary === 'object' ? primary.code : primary;
           }
           
           // Nếu user chưa gán quyền (Khách hàng mặc định), ta tính là ROLE_USER hoặc rỗng
           if (!roleCode && roleFilter === 'ROLE_USER') return true;
           return roleCode === roleFilter;
        });
      }
      
      // 3. Sort
      if (sortFilter === 'NEWEST') {
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (dateB !== dateA) return dateB - dateA;
          return String(b.id || '').localeCompare(String(a.id || ''));
        });
      } else if (sortFilter === 'A_Z') {
        result.sort((a, b) => String(a.fullName || '').localeCompare(String(b.fullName || ''), 'vi'));
      } else if (sortFilter === 'Z_A') {
        result.sort((a, b) => String(b.fullName || '').localeCompare(String(a.fullName || ''), 'vi'));
      }
      
      setFilteredUsers(result);
      
      // Khắc phục lỗi nhảy về trang 1 khi danh sách load lại
      // Lấy max trang sau khi lọc
      const maxPage = Math.ceil(result.length / itemsPerPage) || 1;
      setCurrentPage(prev => (prev > maxPage ? maxPage : prev));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [keyword, statusFilter, sortFilter, roleFilter, users]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      let displayRole = '';
      if (user.role) {
        displayRole = typeof user.role === 'object' ? user.role.code : user.role;
      } else if (Array.isArray(user.roles)) {
        const userRoles = user.roles.map(r => typeof r === 'object' ? r.code : r);
        displayRole = userRoles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : (userRoles[0] || '');
      }
      setSelectedRoles(displayRole ? [displayRole] : []);
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || '',
        status: user.status || 'ACTIVE',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '', // Extract just YYYY-MM-DD
        passwordHash: '' // Don't normally fetch password, leave empty for editing (maybe backend accepts empty meaning no-change)
      });
    } else {
      setEditingUser(null);
      setSelectedRoles(['ROLE_USER']);
      setFormData({ fullName: '', phone: '', email: '', gender: '', status: 'ACTIVE', dateOfBirth: '2000-01-01', passwordHash: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isDuplicateEmail = users.some(u => 
      u.email && formData.email &&
      u.email.toLowerCase() === formData.email.toLowerCase().trim() && 
      (!editingUser || u.id !== editingUser.id)
    );

    if (isDuplicateEmail) {
       toast.error("Email này đã tồn tại trong hệ thống! Vui lòng sử dụng email khác.");
       return;
    }

    const isDuplicatePhone = users.some(u => 
      u.phone && formData.phone &&
      u.phone.trim() === formData.phone.trim() && 
      (!editingUser || u.id !== editingUser.id)
    );

    if (isDuplicatePhone) {
       toast.error("Số điện thoại này đã tồn tại trong hệ thống! Vui lòng sử dụng số điện thoại khác.");
       return;
    }

    // Construct a clean payload to avoid Jackson parsing errors on backend
    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender,
      status: formData.status
    };

    // Only send dateOfBirth if it's not empty
    if (formData.dateOfBirth) {
       payload.dateOfBirth = formData.dateOfBirth.includes('T') ? formData.dateOfBirth : `${formData.dateOfBirth}T00:00:00`;
    }
    
    // Only send password fields if user actually typed a new password
    if (formData.passwordHash && formData.passwordHash.trim() !== '') {
       payload.passwordHash = formData.passwordHash;
       payload.password = formData.passwordHash;
    }

    try {
      if (editingUser) {
        const targetId = editingUser.id || editingUser.userId || editingUser.accountId;
        if (!targetId) {
           toast.error("Lỗi dữ liệu: Cả 2 tài khoản đang bị mất ID định danh hoặc trùng ID");
           return;
        }

        await userApi.update(targetId, payload);
        
        // Only update role if it actually changed
        const originalRole = editingUser.roles?.[0]?.code || editingUser.role?.code || 'ROLE_STAFF';
        if (selectedRoles.length > 0 && selectedRoles[0] !== originalRole) {
            console.log(`🚀 [DEBUG] Bắt đầu gọi API update ROLE cho ID: ${targetId} với quyền:`, selectedRoles);
            await userApi.updateRole(targetId, selectedRoles);
        }
        
        toast.success("Cập nhật thành công!");
        
        // Cập nhật giao diện tạm thời (Optimistic Update) để người dùng thấy ngay thay đổi
        setUsers(prev => prev.map(u => {
          if ((u.id || u.userId) === targetId) {
             const code = selectedRoles[0];
             const r = allRoles.find(role => role.code === code);
             const newRole = r ? { ...r } : { code, name: code === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng' };
             return { ...u, ...payload, role: newRole };
          }
          return u;
        }));
      } else {
        const res = await userApi.create(payload);
        const newUserId = res.data?.id || res.data?.userId;
        if (newUserId && selectedRoles.length > 0) {
            try {
               await userApi.updateRole(newUserId, selectedRoles);
            } catch (err) {
               console.error("Lỗi gán quyền:", err);
               toast.error("Tạo tài khoản thành công nhưng gán quyền thất bại!");
            }
        }
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      
      // Fetch lại dữ liệu sau để đồng bộ chính xác từ Backend (nới lỏng thời gian chờ cho DB transaction commit)
      setTimeout(() => {
         fetchData();
      }, 800);
      
    } catch (error) {
      console.error("Update error:", error.response || error);
      const errorMsg = error.response?.data?.message || error.message || "Không rõ nguyên nhân";
      toast.error("Thao tác thất bại: " + errorMsg);
    }
  };

  const executeDelete = async () => {
    if (!deleteModal.userId) return;
    try {
      setLoading(true);
      await userApi.delete(deleteModal.userId);
      toast.success('Đã xóa người dùng!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xóa người dùng!');
    } finally {
      setDeleteModal({ isOpen: false, userId: null });
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await userApi.updateStatus(user.id, newStatus);
      toast.success(`Đã đổi trạng thái ${user.fullName} thành ${newStatus}`);
      fetchData();
    } catch (error) {
       console.error(error);
       toast.error("Lỗi đổi trạng thái!");
    }
  };

  const getRoleLabel = (user) => {
    if (!user || (!user.role && !user.roles)) 
      return { label: 'Khách hàng', style: { color: '#059669' }};
    
    let primaryRole;
    if (user.role) {
      primaryRole = user.role;
    } else if (Array.isArray(user.roles) && user.roles.length > 0) {
      const adminRole = user.roles.find(r => (typeof r === 'object' ? r.code : r) === 'ROLE_ADMIN');
      primaryRole = adminRole || user.roles[0];
    } else {
      return { label: 'Khách hàng', style: { color: '#059669' }};
    }
    
    const roleCode = typeof primaryRole === 'object' ? primaryRole.code : primaryRole;
    const roleName = typeof primaryRole === 'object' ? primaryRole.name : null;
    
    const finalRoleName = roleName || (roleCode === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng');
    const color = roleCode === 'ROLE_ADMIN' ? '#ef4444' : '#059669';
    
    return { label: finalRoleName, style: { color } };
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <>
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: null })}
        onConfirm={executeDelete}
        title="Xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác."
        isDangerous={true}
      />

      <div className="header-top">
        <div className="page-title-area">
          <h1>Quản lý Danh sách Người Dùng</h1>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} color="#999" />
            <input 
              type="text" 
              placeholder="Tìm user bằng tên, sđt..." 
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
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="ui-select"
            >
              <option value="ALL">Tất cả vai trò</option>
              {allRoles.map(r => (
                 <option key={r.code || r.id} value={r.code}>{r.name || r.code}</option>
              ))}
              {/* Fallback nếu allRoles chưa load kịp hoặc bị lỗi */}
              {allRoles.length === 0 && (
                <>
                  <option value="ROLE_ADMIN">Quản trị viên</option>
                  <option value="ROLE_STAFF">Nhân viên</option>
                  <option value="ROLE_USER">Khách hàng</option>
                </>
              )}
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
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> Thêm người dùng
          </button>
        </div>
      </div>

      <div className="dashboard-cards" style={{ marginTop: 24, marginBottom: 8, marginInline: 40, padding: 0 }}>
        <div className="stat-card-horizontal">
           <div className="stat-icon-circle" style={{ background: '#f3e8ff', color: '#a855f7' }}>
              <Users size={24} />
           </div>
           <div className="stat-content">
              <div className="stat-label">Tổng người dùng</div>
              <div className="stat-number">{stats.totalUsers}</div>
           </div>
        </div>
        <div className="stat-card-horizontal">
           <div className="stat-icon-circle green" style={{ background: '#d1fae5', color: '#10b981' }}>
              <CheckCircle size={32} strokeWidth={3} />
           </div>
           <div className="stat-content">
              <div className="stat-label">Đang hoạt động</div>
              <div className="stat-number">{stats.activeUsers < 10 && stats.activeUsers > 0 ? `0${stats.activeUsers}` : stats.activeUsers}</div>
           </div>
        </div>
        <div className="stat-card-horizontal">
           <div className="stat-icon-circle red" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={32} strokeWidth={3} />
           </div>
           <div className="stat-content">
              <div className="stat-label">Bị khóa / Không HĐ</div>
              <div className="stat-number">{stats.lockedUsers < 10 && stats.lockedUsers > 0 ? `0${stats.lockedUsers}` : stats.lockedUsers}</div>
           </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-header-controls">
          <h2>Danh sách tài khoản hệ thống</h2>
        </div>

        <div className="custom-table">
          <div className="table-head">
            <div className="col-name" style={{ flex: '1.2' }}>THÔNG TIN NGƯỜI DÙNG</div>
            <div className="col-desc" style={{ flex: '0.8' }}>VAI TRÒ</div>
            <div className="col-status" style={{ flex: '0.8', color: '#9ca3af' }}>TRẠNG THÁI</div>
            <div className="col-count" style={{ flex: '0.8' }}>NGÀY TẠO</div>
            <div className="col-action" style={{ flex: '0.8' }}>THAO TÁC</div>
          </div>
          
          <div className="table-body">
            {loading ? (
              <div className="loading-state">Đang tải dữ liệu...</div>
            ) : currentUsers.length === 0 ? (
              <div className="empty-state">Không có người dùng nào trùng khớp</div>
            ) : (
              currentUsers.map((user, index) => {
                const isActive = user.status === 'ACTIVE';
                const role = getRoleLabel(user);
                
                return (
                  <div className="table-row" key={user.id || index}>
                    <div className="col-name" style={{ flex: '1.2', display: 'flex', alignItems: 'center', gap: 12 }}>
                       <img 
                         src={user.avatarUrl || defaultAvatar} 
                         onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                         alt="Avatar" 
                         style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#f3f4f6' }} 
                       />
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontWeight: 600, color: '#1f2937' }}>{user.fullName || 'No Name'}</span>
                         <span style={{ fontSize: 13, color: '#6b7280' }}>{user.phone || user.email || 'Không có liên hệ'}</span>
                       </div>
                    </div>
                    
                    <div className="col-desc" style={{ flex: '0.8' }}>
                      <span style={{ fontWeight: 600, ...role.style }}>{role.label}</span>
                    </div>

                    <div className="col-status" style={{ flex: '0.8' }}>
                      <button 
                        type="button"
                        className={`status-tag ${isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </button>
                    </div>
                    
                    <div className="col-count" style={{ flex: '0.8', color: '#6b7280', fontSize: 14 }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
                    </div>

                    <div className="col-action" style={{ flex: '0.8', display: 'flex', gap: '8px' }}>
                      <button 
                         onClick={() => setDetailModalUser(user)} 
                         title="Xem chi tiết"
                         style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f3f4f6', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                         onClick={() => handleOpenModal(user)} 
                         title="Chỉnh sửa"
                         style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fef3c7', color: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                         onClick={() => setDeleteModal({ isOpen: true, userId: user.id })} 
                         title="Xóa"
                         style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="pagination-area">
          <span className="page-info">
            Hiển thị {filteredUsers.length === 0 ? 0 : startIndex + 1} đến {Math.min(endIndex, filteredUsers.length)} trong số {filteredUsers.length} người dùng
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
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: 450, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
             <h2 style={{ margin: '0 0 24px 0', fontSize: 20 }}>{editingUser ? 'Cập nhật tài khoản' : 'Thêm mới tài khoản'}</h2>
             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>Họ và Tên</label>
                  <input required style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
               </div>
               <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>Email</label>
                  <input required type="email" onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập địa chỉ email hợp lệ và không được để trống')} onInput={(e) => e.target.setCustomValidity('')} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="nguyenvana@gmail.com" />
               </div>
               <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>Số điện thoại</label>
                  <input required type="tel" pattern="0[35789][0-9]{8}" title="Vui lòng nhập định dạng SĐT Việt Nam (10 số, VD: 0987654321)" onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập định dạng SĐT Việt Nam hợp lệ (10 số)')} onInput={(e) => e.target.setCustomValidity('')} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0901234567" />
               </div>
               <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>Ngày sinh</label>
                  <input type="date" required style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }} value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
               </div>
               <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>Mật khẩu {!editingUser && '(Tạo mới)'}</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                     <input type={showModalPassword ? "text" : "password"} required={!editingUser} style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none' }} value={formData.passwordHash} onChange={e => setFormData({...formData, passwordHash: e.target.value})} placeholder="********" pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$" title="Mật khẩu phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)" onInvalid={(e) => { if (!editingUser || e.target.value) e.target.setCustomValidity('Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)'); }} onInput={(e) => e.target.setCustomValidity('')} />
                     <button type="button" onClick={() => setShowModalPassword(!showModalPassword)} style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                       {showModalPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
               </div>
               <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>Giới tính</label>
                  <select required style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none', appearance: 'auto' }} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                     <option value="" disabled>-- Chọn giới tính --</option>
                     <option value="MALE">Nam</option>
                     <option value="FEMALE">Nữ</option>
                     <option value="OTHER">Khác</option>
                  </select>
               </div>
                 <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>Trạng thái</label>
                  <select style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none', appearance: 'auto' }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                     <option value="ACTIVE">Hoạt động</option>
                     <option value="INACTIVE">Không hoạt động</option>
                  </select>
               </div>
               
               {allRoles.length > 0 && (
                 <div>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#374151' }}>Phân quyền tài khoản</label>
                    <select 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #d1d5db', outline: 'none', appearance: 'auto' }} 
                      value={selectedRoles[0] || ''} 
                      onChange={e => setSelectedRoles([e.target.value])}
                    >
                       <option value="" disabled>-- Chọn quyền --</option>
                       {allRoles.map(r => (
                         <option key={r.code || r.id} value={r.code}>
                           {r.name || r.code}
                         </option>
                       ))}
                    </select>
                 </div>
               )}
               
               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Hủy đóng</button>
                  <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Lưu thông tin</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {detailModalUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: 450, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
             <h2 style={{ margin: '0 0 24px 0', fontSize: 20 }}>Chi tiết tài khoản</h2>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15, color: '#374151' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                   <img src={detailModalUser.avatarUrl || defaultAvatar} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f3f4f6' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                   <strong style={{ color: '#6b7280' }}>Họ và tên:</strong> <span>{detailModalUser.fullName || 'Trống'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                   <strong style={{ color: '#6b7280' }}>Email:</strong> <span>{detailModalUser.email || 'Trống'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                   <strong style={{ color: '#6b7280' }}>Số điện thoại:</strong> <span>{detailModalUser.phone || 'Trống'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                   <strong style={{ color: '#6b7280' }}>Giới tính:</strong> <span>{detailModalUser.gender === 'MALE' ? 'Nam' : detailModalUser.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                   <strong style={{ color: '#6b7280' }}>Ngày sinh:</strong> <span>{detailModalUser.dateOfBirth ? new Date(detailModalUser.dateOfBirth).toLocaleDateString('vi-VN') : 'Trống'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                   <strong style={{ color: '#6b7280' }}>Vai trò:</strong> <span>{getRoleLabel(detailModalUser).label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                   <strong style={{ color: '#6b7280' }}>Trạng thái:</strong> <span>{detailModalUser.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <strong style={{ color: '#6b7280' }}>Ngày tham gia:</strong> <span>{detailModalUser.createdAt ? new Date(detailModalUser.createdAt).toLocaleDateString('vi-VN') : 'Trống'}</span>
                </div>
             </div>
             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button onClick={() => setDetailModalUser(null)} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>Đóng lại</button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserPage;
