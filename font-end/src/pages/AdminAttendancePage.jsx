import React, { useState, useEffect } from 'react';
import { 
  Search, CheckCircle2, Clock, CalendarDays, Calendar, Plus,
  Filter, ChevronLeft, ChevronRight, AlertTriangle, Users, Pencil, Trash2
} from 'lucide-react';
import { adminAttendanceApi } from '../api/adminAttendanceApi';
import { userApi } from '../api/userApi';
import { useToast } from '../contexts/ToastContext';
import './AdminAttendancePage.css';

const AdminAttendancePage = () => {
  const [data, setData] = useState([]);
  const [usersInfo, setUsersInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const toast = useToast();


  const [viewMode, setViewMode] = useState('daily');
  const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [userDetailRecords, setUserDetailRecords] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Modal Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modal Create states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:00',
    checkOut: '17:00'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Tải danh sách tất cả các User
      let usersMap = {};
      try {
        const usersRes = await userApi.getAll();
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.content || []);
        usersMap = (Array.isArray(usersData) ? usersData : []).reduce((acc, user) => {
          const parts = (user.fullName || 'Khach').split(' ');
          const avatar = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase();
          // Store with both string and number key for safe lookup
          acc[String(user.id)] = { ...user, avatar };
          acc[user.id] = { ...user, avatar };
          return acc;
        }, {});
        setUsersInfo(usersMap);
      } catch (err) {
        console.warn("Lỗi tải users để map:", err);
      }

      // 2. Tải danh sách chấm công theo Ngày đã chọn (Bắt buộc theo yêu cầu Backend)
      const records = await adminAttendanceApi.getAll({ date: selectedDate });
      
      if (Array.isArray(records)) {
        setData(records);
      }
    } catch (error) {
      console.error("Lỗi tải chấm công:", error);
      const errorMsg = error.response ? `Lỗi ${error.response.status}` : error.message;
      toast.error(`Không thể tải dữ liệu chấm công (${errorMsg})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [activeTab, selectedDate]);

  const loadMonthlyData = async () => {
    setMonthlyLoading(true);
    try {
      // Load users if not yet loaded
      if (Object.keys(usersInfo).length === 0) {
        try {
          const usersRes = await userApi.getAll();
          const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.content || []);
          const usersMap = (Array.isArray(usersData) ? usersData : []).reduce((acc, user) => {
            const parts = (user.fullName || 'NV').split(' ');
            const avatar = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : (parts[0][0] || 'N').toUpperCase();
            acc[String(user.id)] = { ...user, avatar };
            acc[user.id] = { ...user, avatar };
            return acc;
          }, {});
          setUsersInfo(usersMap);
        } catch (e) {
          console.warn('Could not load users for monthly view', e);
        }
      }

      const [year, month] = selectedMonth.split('-');
      const records = await adminAttendanceApi.getByMonth(parseInt(month), parseInt(year));
      const grouped = {};
      records.forEach(r => {
        const uid = String(r.userId);
        if (!grouped[uid]) grouped[uid] = { userId: r.userId, totalHours: 0, approvedHours: 0, totalShifts: 0, pendingShifts: 0 };
        grouped[uid].totalShifts++;
        grouped[uid].totalHours += r.workingHours || 0;
        if (r.status === 'APPROVED') grouped[uid].approvedHours += r.workingHours || 0;
        if (r.status === 'PENDING') grouped[uid].pendingShifts++;
      });
      setMonthlyData(Object.values(grouped));
    } catch (err) {
      toast.error('Khong the tai du lieu thang: ' + (err.response?.data?.message || err.message));
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'monthly') loadMonthlyData();
  }, [viewMode, selectedMonth]);

  const handleViewUserDetail = async (userId) => {
    setSelectedUserDetail(userId);
    setDetailLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const records = await adminAttendanceApi.getByUserAndMonth(userId, parseInt(month), parseInt(year));
      setUserDetailRecords(records);
    } catch (err) {
      toast.error('L\u1ed7i t\u1ea3i chi ti\u1ebft nh\u00e2n vi\u00ean');
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredData = (Array.isArray(data) ? data : []).filter(d => {
    if (activeTab !== 'ALL' && d.status?.toUpperCase() !== activeTab) return false;

    const matchedUser = usersInfo[d.userId] || {};
    const fName = (matchedUser.fullName || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return fName.includes(q) || (matchedUser.roles?.[0]?.name?.toLowerCase() || '').includes(q) || (d.date && d.date.includes(q));
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleInlineStatusUpdate = async (id, newStatus) => {
    const prevData = [...data];
    setData(data.map(d => d.id === id ? { ...d, status: newStatus } : d));
    
    try {
      await adminAttendanceApi.updateStatus(id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      setData(prevData); // Tái thiết lập dữ liệu cũ nếu lỗi
      const errorMsg = error.response ? `Lỗi ${error.response.status}` : error.message;
      toast.error(`Cập nhật thất bại (${errorMsg})`);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    const formatToTimeInput = (iso) => {
      if (!iso) return '';
      if (iso.includes('T')) return iso.split('T')[1].substring(0, 5);
      return iso.length > 5 ? iso.substring(0, 5) : iso;
    };
    
    setEditCheckIn(formatToTimeInput(item.checkIn));
    setEditCheckOut(formatToTimeInput(item.checkOut));
    setShowEditModal(true);
  };

  const handleSaveTimes = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    
    try {
      // Create final ISO strings handling local date logic
      const baseDateStr = editingItem.date ? editingItem.date.split('T')[0] : selectedDate;
      const finalCheckIn = editCheckIn ? `${baseDateStr}T${editCheckIn}:00` : null;
      const finalCheckOut = editCheckOut ? `${baseDateStr}T${editCheckOut}:00` : null;

      const response = await adminAttendanceApi.updateTimes(editingItem.id, finalCheckIn, finalCheckOut);
      toast.success("Cập nhật thời gian thành công!");
      
      // Bắt trực tiếp dữ liệu trả về từ API PUT vì Backend đã có logic tính totalHours
      const updatedItem = response?.data?.data || response?.data || {};
      
      setData(data.map(d => {
        if (d.id === editingItem.id) {
            return {
                ...d,
                checkIn: finalCheckIn,
                checkOut: finalCheckOut,
                status: 'PENDING',
                workingHours: updatedItem.workingHours !== undefined ? updatedItem.workingHours : d.workingHours
            };
        }
        return d;
      }));

      setShowEditModal(false);
      // Vẫn lấy lại data nền tảng cho chắc chắn
      await loadData();
    } catch (err) {
      toast.error("Cập nhật thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubmit = async () => {
    if (!createData.userId || !createData.date || !createData.checkIn) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc (Nhân viên, Ngày, Giờ vào)');
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        userId: Number(createData.userId),
        date: createData.date,
        checkIn: `${createData.date}T${createData.checkIn}:00`,
        checkOut: createData.checkOut ? `${createData.date}T${createData.checkOut}:00` : null
      };

      await adminAttendanceApi.create(payload);
      toast.success('Thêm lượt chấm công thành công!');
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      toast.error('Lỗi khi thêm: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* HEADER TOP */}
      <div className="header-top">
        <div className="page-title-area">
          <h1>Quản lý Chấm công</h1>
        </div>
        <div className="header-actions">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhân viên..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-create-booking" onClick={() => setShowCreateModal(true)}>
             <Plus size={18} /> Thêm chấm công
          </button>
        </div>
      </div>

      <div className="attendance-page" style={{ marginTop: '32px' }}>

        {/* MONTHLY SUMMARY VIEW */}
        {viewMode === 'monthly' && (
          <div className="table-section">
            <div className="table-tabs-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedUserDetail && (
                  <button onClick={() => setSelectedUserDetail(null)}
                    style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: '#475569' }}>
                    &larr; Quay lai
                  </button>
                )}
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                  {selectedUserDetail
                    ? 'Chi tiet: ' + (usersInfo[selectedUserDetail]?.fullName || 'NV#' + selectedUserDetail)
                    : 'Tong gio lam theo nhan vien'}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Calendar size={18} color="#94a3b8" />
                <input type="month" value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setSelectedUserDetail(null); }}
                  style={{ border: 'none', outline: 'none', color: '#374151', fontWeight: 600, fontSize: '14px', background: 'transparent', cursor: 'pointer' }} />
              </div>
            </div>
            {!selectedUserDetail ? (
              <table className="attendance-table">
                <thead><tr>
                  <th>Nhan vien</th>
                  <th style={{ textAlign: 'center' }}>Tong ca</th>
                  <th style={{ textAlign: 'center' }}>Tong gio</th>
                  <th style={{ textAlign: 'center' }}>Gio da duyet (tinh luong)</th>
                  <th style={{ textAlign: 'center' }}>Cho duyet</th>
                  <th style={{ textAlign: 'center' }}>Chi tiet</th>
                </tr></thead>
                <tbody>
                  {monthlyLoading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Dang tai...</td></tr>
                  ) : monthlyData.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Khong co du lieu chấm cong trong thang nay.</td></tr>
                  ) : monthlyData.map(row => {
                    const emp = usersInfo[row.userId] || { fullName: 'NV #' + row.userId };
                    return (
                      <tr key={row.userId}>
                        <td>
                          <div className="employee-cell">
                            <div className="employee-info-detail" style={{ marginLeft: 0 }}>
                              <span className="employee-name">{emp.fullName}</span>
                              <span className="employee-role">{emp.roles?.[0]?.name || 'Nhan vien'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}><span className="cell-total-hours">{row.totalShifts} ca</span></td>
                        <td style={{ textAlign: 'center' }}><span className="cell-total-hours">{row.totalHours.toFixed(1)}h</span></td>
                        <td style={{ textAlign: 'center' }}><span style={{ color: '#10b981', fontWeight: 700 }}>{row.approvedHours.toFixed(1)}h</span></td>
                        <td style={{ textAlign: 'center' }}>
                          {row.pendingShifts > 0
                            ? <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{row.pendingShifts} ca</span>
                            : <span style={{ color: '#94a3b8' }}>-</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => handleViewUserDetail(row.userId)}
                            style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                            Xem chi tiet
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="attendance-table">
                <thead><tr>
                  <th>Ngay</th><th>Gio vao</th><th>Gio ra</th>
                  <th style={{ textAlign: 'center' }}>Tong gio</th><th>Trang thai</th>
                </tr></thead>
                <tbody>
                  {detailLoading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Dang tai...</td></tr>
                  ) : userDetailRecords.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Khong co du lieu.</td></tr>
                  ) : userDetailRecords.map((r, i) => {
                    const fmt = t => { if (!t) return '--:--'; if (t.includes('T')) return t.split('T')[1].substring(0, 5); return t.substring(0, 5); };
                    const d = new Date(r.date || r.checkIn);
                    const ds = String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
                    return (
                      <tr key={r.id || i}>
                        <td>{ds}</td>
                        <td><span className="cell-time-large">{fmt(r.checkIn)}</span></td>
                        <td><span className={r.checkOut ? 'cell-time-large' : 'cell-time-empty'}>{fmt(r.checkOut)}</span></td>
                        <td style={{ textAlign: 'center' }}><span className="cell-total-hours">{(r.workingHours || 0).toFixed(1)}h</span></td>
                        <td>
                          <select className={'status-pill inline-select ' + (r.status?.toUpperCase()==='APPROVED' ? 'status-confirmed' : r.status?.toUpperCase()==='PENDING' ? 'status-pending' : 'status-cancelled')}
                            value={r.status?.toUpperCase() || 'PENDING'}
                            onChange={e => handleInlineStatusUpdate(r.id, e.target.value)}>
                            <option value="PENDING">CHO XAC NHAN</option>
                            <option value="APPROVED">DA XAC NHAN</option>
                            <option value="REJECTED">TU CHOI</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* DAILY VIEW */}
        {viewMode === 'daily' && (
        <div className="table-section">
          <div className="table-tabs-header">
            <div className="tabs-list">
              <button className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>Tất cả</button>
              <button className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`} onClick={() => setActiveTab('PENDING')}>Chưa xác nhận</button>
              <button className={`tab-btn ${activeTab === 'APPROVED' ? 'active' : ''}`} onClick={() => setActiveTab('APPROVED')}>Đã xác nhận</button>
              <button className={`tab-btn ${activeTab === 'REJECTED' ? 'active' : ''}`} onClick={() => setActiveTab('REJECTED')}>Đã từ chối</button>
            </div>
            <div className="date-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
               <Calendar size={18} color="#94a3b8" />
               <input 
                 type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 style={{ border: 'none', outline: 'none', color: '#374151', fontWeight: 600, fontSize: '14px', background: 'transparent', cursor: 'pointer' }}
               />
            </div>
          </div>

          <table className="attendance-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Ngày</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th style={{ textAlign: 'center' }}>Tổng giờ</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Không tìm thấy lượt chấm công nào.</td>
                </tr>
              ) : (
                currentData.map(item => {
                  const emp = usersInfo[item.userId] || usersInfo[String(item.userId)] || { fullName: `Nhan vien #${item.userId}`, role: 'Nhan vien', avatar: 'NV' };
                  const userRole = emp.roles && emp.roles.length > 0 ? emp.roles[0].name : 'Nhan vien';
                  
                  // Format Date and Time
                  let dateStr = item.date || '';
                  if (dateStr.includes('T')) dateStr = dateStr.split('T')[0];
                  
                  // Convert YYYY-MM-DD to DD-MM-YYYY
                  if (dateStr && dateStr.includes('-')) {
                    const [y, m, d] = dateStr.split('-');
                    if (y.length === 4) {
                      dateStr = `${d}-${m}-${y}`;
                    }
                  }
                  
                  const formatTime = (t) => {
                    if (!t) return null;
                    if (t.includes('T')) return t.split('T')[1].substring(0, 5);
                    return t.length > 5 ? t.substring(0, 5) : t;
                  };

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="employee-cell">
                          <div className="employee-info-detail" style={{ marginLeft: 0 }}>
                            <span className="employee-name">{emp.fullName}</span>
                            <span className="employee-role">{userRole}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="date-text">{dateStr}</span>
                      </td>
                      <td>
                        <span className={item.checkIn ? "cell-time-large" : "cell-time-empty"}>{formatTime(item.checkIn) || '--:--'}</span>
                      </td>
                      <td>
                        <span className={item.checkOut ? "cell-time-large" : "cell-time-empty"}>{formatTime(item.checkOut) || '--:--'}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="cell-total-hours">{((item.workingHours !== undefined ? item.workingHours : item.totalHours) || 0).toFixed(1)}h</span>
                      </td>
                      <td>
                        <select 
                          className={`status-pill inline-select ${
                            item.status?.toUpperCase() === 'APPROVED' ? 'status-confirmed' : 
                            item.status?.toUpperCase() === 'PENDING' ? 'status-pending' : 
                            'status-cancelled'
                          }`}
                          value={item.status?.toUpperCase() || 'PENDING'}
                          onChange={(e) => handleInlineStatusUpdate(item.id, e.target.value)}
                        >
                          <option value="PENDING">CHỜ XÁC NHẬN</option>
                          <option value="APPROVED">ĐÃ XÁC NHẬN</option>
                          <option value="REJECTED">TỪ CHỐI</option>
                        </select>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="att-action-btn" title="Chinh sua" onClick={() => handleEditClick(item)}>
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="pagination">
            <div className="pagination-text">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} trong {filteredData.length} kết quả
            </div>
            <div className="pagination-controls">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        )}

      </div>

      {showEditModal && editingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                  Chỉnh sửa chấm công
                </h2>
             </div>
             
             <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Nhân viên</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', fontSize: '12px' }}>
                    {usersInfo[editingItem.userId]?.avatar || 'NV'}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{usersInfo[editingItem.userId]?.fullName || `Nhân viên #${editingItem.userId}`}</span>
                </div>
             </div>
             
             <div style={{ marginBottom: '16px' }}>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Giờ vào check-in</label>
               <input type="time" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 500, fontSize: '15px' }} value={editCheckIn} onChange={e => setEditCheckIn(e.target.value)} />
             </div>

             <div style={{ marginBottom: '32px' }}>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Giờ ra check-out</label>
               <input type="time" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 500, fontSize: '15px' }} value={editCheckOut} onChange={e => setEditCheckOut(e.target.value)} />
             </div>

             <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <button onClick={() => setShowEditModal(false)} style={{ padding: '10px 20px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Hủy bỏ</button>
                <button onClick={handleSaveTimes} disabled={isSaving} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   {isSaving ? 'Đang lưu...' : 'Lưu lại'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* CREATE ATTENDANCE MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                  Thêm mới chấm công
                </h2>
             </div>
             
             <div style={{ marginBottom: '16px' }}>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Nhân viên (*)</label>
               <select 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 500, fontSize: '15px' }}
                  value={createData.userId}
                  onChange={(e) => setCreateData({ ...createData, userId: e.target.value })}
               >
                 <option value="">-- Chọn nhân viên --</option>
                 {Object.values(usersInfo).filter(user => {
                   const roleCode = user.roles?.[0]?.code || user.role?.code || '';
                   const roleName = user.roles?.[0]?.name || user.role?.name || '';
                   return roleCode === 'ROLE_STAFF' || roleCode === 'ROLE_MANAGER'
                     || roleName === 'STAFF' || roleName === 'MANAGER';
                 }).map(user => (
                   <option key={user.id} value={user.id}>{user.fullName}</option>
                 ))}
               </select>
             </div>

             <div style={{ marginBottom: '16px' }}>
               <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Ngày (*)</label>
               <input 
                  type="date" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 500, fontSize: '15px' }} 
                  value={createData.date} 
                  onChange={e => setCreateData({ ...createData, date: e.target.value })} 
               />
             </div>
             
             <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
               <div style={{ flex: 1 }}>
                 <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Giờ vào (*)</label>
                 <input type="time" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 500 }} value={createData.checkIn} onChange={e => setCreateData({ ...createData, checkIn: e.target.value })} />
               </div>
               <div style={{ flex: 1 }}>
                 <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>Giờ ra</label>
                 <input type="time" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', fontWeight: 500 }} value={createData.checkOut} onChange={e => setCreateData({ ...createData, checkOut: e.target.value })} />
               </div>
             </div>

             <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '32px' }}>
                <button onClick={() => setShowCreateModal(false)} style={{ padding: '10px 20px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Hủy bỏ</button>
                <button onClick={handleCreateSubmit} disabled={isSaving} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   {isSaving ? 'Đang thêm...' : 'Lưu lại'}
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAttendancePage;
