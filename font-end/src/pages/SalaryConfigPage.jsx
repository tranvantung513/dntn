import React, { useState, useEffect } from 'react';
import { Edit, Users, Save, Search, Bell, Grid, Calendar, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { userApi } from '../api/userApi';
import { salaryConfigApi } from '../api/salaryConfigApi';
import { salaryApi } from '../api/salaryApi';
import { useToast } from '../contexts/ToastContext';
import './SalaryConfigPage.css';

const SalaryConfigPage = () => {
  const [users, setUsers] = useState([]);
  const [salaryConfigs, setSalaryConfigs] = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(4);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [isPayrollLoading, setIsPayrollLoading] = useState(false);
  const [isPayrollEditModalOpen, setIsPayrollEditModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState({ userId: null, allowance: 0, deduction: 0, name: '' });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmployeeListModalOpen, setIsEmployeeListModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const [formData, setFormData] = useState({
    id: null,
    userId: '',
    position: 'STAFF',
    salaryPerHour: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, configsRes] = await Promise.all([
        userApi.getAll(),
        salaryConfigApi.getAll()
      ]);
      
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.content || []);
      setUsers(usersData);
      
      const configsData = Array.isArray(configsRes.data) ? configsRes.data : (configsRes.data?.data || []);
      setSalaryConfigs(configsData);
      
    } catch (err) {
      toast.error('Lỗi khi tải dữ liệu hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadPayroll = async () => {
    setIsPayrollLoading(true);
    try {
      const res = await salaryApi.getAll(selectedMonth, selectedYear);
      console.log("loadPayroll raw response:", res);
      
      let resData = res.data;
      let finalArray = [];
      
      if (Array.isArray(resData)) {
        finalArray = resData;
      } else if (resData && typeof resData === 'object') {
        if (Array.isArray(resData.content)) {
          finalArray = resData.content;
        } else if (resData.data && Array.isArray(resData.data.content)) {
          finalArray = resData.data.content;
        } else if (Array.isArray(resData.data)) {
          finalArray = resData.data;
        } else if (Array.isArray(resData.items)) {
          finalArray = resData.items;
        }
      }
      
      console.log("loadPayroll parsed array:", finalArray);
      setPayrollList(finalArray);
    } catch (err) {
      console.error("loadPayroll error:", err);
      toast.error('Lỗi tải danh sách thực nhận: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsPayrollLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, [selectedMonth, selectedYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Tự động suy ra role (position) nếu chọn nhân viên, giả lập ở client
    if (name === 'userId') {
      const selectedUser = users.find(u => u.id.toString() === value);
      let autoPosition = 'STAFF';
      if (selectedUser?.roles?.length > 0) {
        if (selectedUser.roles[0].name === 'ADMIN') autoPosition = 'MANAGER';
      }
      setFormData(prev => ({ ...prev, [name]: value, position: autoPosition }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSalaryChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, salaryPerHour: val }));
  };

  const formatMoney = (amount) => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  const handleSubmit = async () => {
    if (!formData.userId || !formData.salaryPerHour) {
      toast.error('Vui lòng điền nhân viên và mức lương!');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        userId: Number(formData.userId),
        position: formData.position,
        salaryPerHour: Number(formData.salaryPerHour)
      };

      if (formData.id) {
        await salaryConfigApi.update(formData.id, payload);
        toast.success('Cập nhật mức lương thành công!');
      } else {
        await salaryConfigApi.create(payload);
        toast.success('Thiết lập mức lương mới thành công!');
      }

      setFormData({ id: null, userId: '', position: 'STAFF', salaryPerHour: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thiết lập.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (config) => {
    setFormData({
      id: config.id,
      userId: config.userId.toString(),
      position: config.position || 'STAFF',
      salaryPerHour: config.salaryPerHour.toString()
    });
    // Cuộn lên form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cấu hình lương này?')) return;
    try {
      await salaryConfigApi.delete(id);
      toast.success('Đã xóa thành công!');
      loadData();
    } catch (err) {
      toast.error('Có lỗi xảy ra khi xóa!');
    }
  };

  const handleEditPayrollSubmit = async (e) => {
    e.preventDefault();
    try {
      await salaryApi.update(editingPayroll.userId, selectedMonth, selectedYear, {
        allowance: Number(editingPayroll.allowance),
        deduction: Number(editingPayroll.deduction)
      });
      toast.success('Cập nhật thành công!');
      setIsPayrollEditModalOpen(false);
      loadPayroll();
    } catch (err) {
      toast.error('Lỗi cập nhật bảng lương!');
    }
  };

  const handleDeletePayroll = (userId, name) => {
    setPayrollToDelete({ userId, name });
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePayroll = async () => {
    if (!payrollToDelete) return;
    try {
      await salaryApi.delete(payrollToDelete.userId, selectedMonth, selectedYear);
      toast.success('Xóa thành công!');
      setIsDeleteModalOpen(false);
      setPayrollToDelete(null);
      loadPayroll();
    } catch (err) {
      toast.error('Lỗi khi xóa lương!');
      setIsDeleteModalOpen(false);
    }
  };

  const handleLockPayroll = async () => {
    if (!window.confirm(`Bạn có chắc chắn chốt lương tháng ${selectedMonth}/${selectedYear}?`)) return;
    try {
      await salaryApi.lock(selectedMonth, selectedYear);
      toast.success('Chốt lương thành công!');
      loadPayroll();
    } catch (err) {
      toast.error('Lỗi khi chốt lương!');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await salaryApi.exportExcel(selectedMonth, selectedYear);
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Bang_Luong_Thang_${selectedMonth}_${selectedYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Xuất file Excel thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi xuất file Excel!');
    }
  };

  const getUserDetails = (userId) => {
    return users.find(u => u.id === userId) || {};
  };

  const filteredPayrollList = payrollList.filter(item => {
    // Lọc theo search term
    const matchSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.userId || '').toString().includes(searchTerm);
    if (!matchSearch) return false;

    // Chỉ hiển thị ROLE_STAFF và ROLE_MANAGER
    const userDetail = users.find(u => u.id === item.userId || u.id?.toString() === item.userId?.toString());
    if (userDetail) {
      const roleCode = userDetail.roles?.[0]?.code || userDetail.role?.code || '';
      const roleName = userDetail.roles?.[0]?.name || userDetail.role?.name || '';
      const isStaffOrManager = 
        roleCode === 'ROLE_STAFF' || roleCode === 'ROLE_MANAGER' || 
        roleName === 'STAFF' || roleName === 'MANAGER';
      
      return isStaffOrManager;
    }
    return false; // Ẩn nếu không tìm thấy user hoặc không có role phù hợp
  });

  return (
    <div className="salary-page">
      <div className="header-top">
        <div className="page-title-area">
          <h1>Quản lý tiền lương</h1>
        </div>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="search-box">
            <Search size={16} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhân viên..." 
              style={{ width: '200px' }} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="page-content" style={{ padding: '24px' }}>
        {/* TOP FORM CARD */}
      <div className="salary-input-card">
        <div className="card-title">
          <div className="icon-wrapper"><Edit size={16} /></div>
          <span>{formData.id ? 'Cập nhật mức lương nhân viên' : 'Nhập mức lương nhân viên'}</span>
        </div>

        <div className="form-row" style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1, maxWidth: '280px' }}>
            <label>CHỌN NHÂN VIÊN</label>
            <select 
              className="form-control form-select" 
              name="userId" 
              value={formData.userId}
              onChange={handleChange}
              disabled={!!formData.id} // Không cho đổi user khi đang edit
            >
              <option value="">Chọn nhân viên...</option>
              {users.filter(u => {
                const roleCode = u.roles?.[0]?.code || u.role?.code || '';
                const roleName = u.roles?.[0]?.name || u.role?.name || '';
                return roleCode === 'ROLE_STAFF' || roleCode === 'ROLE_MANAGER'
                  || roleName === 'STAFF' || roleName === 'MANAGER';
              }).map(u => (
                <option key={u.id} value={u.id}>{u.fullName || `User #${u.id}`}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, maxWidth: '240px' }}>
            <label>VỊ TRÍ</label>
            <select 
              className="form-control form-select" 
              name="position" 
              value={formData.position}
              onChange={handleChange}
            >
              <option value="STAFF">STAFF</option>
              <option value="MANAGER">MANAGER</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, maxWidth: '240px' }}>
            <label>MỨC LƯƠNG (VNĐ)/H</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="0"
                value={formatMoney(formData.salaryPerHour)}
                onChange={handleSalaryChange}
                style={{ paddingRight: '48px' }}
              />
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontWeight: 500 }}>
                VNĐ
              </span>
            </div>
          </div>
        </div>

        <div className="action-row">
          <button className="btn btn-secondary" onClick={() => setIsEmployeeListModalOpen(true)}>
            <Users size={18} /> Xem danh sách nhân viên
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            <Save size={18} /> {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>

      {/* BOTTOM TABLE CARD */}
      <div className="list-section">
        <div className="list-header">
          <h2>Danh sách thực nhận</h2>
          <div className="list-header-actions">
            <div className="date-picker-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <input 
                type="month" 
                value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m] = e.target.value.split('-');
                    setSelectedYear(parseInt(y));
                    setSelectedMonth(parseInt(m));
                  }
                }}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}
              />
            </div>
            <button className="btn-export-excel" style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none' }} onClick={handleLockPayroll}>
              <Save size={16} /> Chốt lương
            </button>
            <button className="btn-export-excel" onClick={handleExportExcel}>
              <FileText size={16} /> Xuất báo cáo Excel
            </button>
          </div>
        </div>

        <table className="salary-table">
          <thead>
            <tr>
              <th>NHÂN VIÊN</th>
              <th style={{textAlign: 'center'}}>TỔNG GIỜ LÀM</th>
              <th>MỨC LƯƠNG</th>
              <th>PHỤ CẤP</th>
              <th>KHẤU TRỪ</th>
              <th>THỰC NHẬN</th>
              <th style={{ textAlign: 'right' }}>HOẠT ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {isPayrollLoading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Đang tải dữ liệu...</td></tr>
            ) : filteredPayrollList.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Chưa có dữ liệu thực nhận.</td></tr>
            ) : (
              filteredPayrollList.map(item => {
                return (
                  <tr key={item.userId}>
                    <td style={{ paddingLeft: 24 }}>
                      <span className="emp-name">{item.name || `Nhân viên #${item.userId}`}</span>
                    </td>
                    <td style={{textAlign: 'center', fontWeight: 500, color: '#374151'}}>{Number(item.totalHours || 0).toFixed(1)}</td>
                    <td style={{fontWeight: 500, color: '#374151'}}>{formatMoney(item.salaryPerHour)}/h</td>
                    <td style={{fontWeight: 500, color: '#374151'}}>{formatMoney(item.allowance)}</td>
                    <td style={{fontWeight: 500, color: item.deduction > 0 ? '#ef4444' : '#ef4444'}}>{item.deduction > 0 ? formatMoney(item.deduction) : '0'}</td>
                    <td>
                      <span className="money-text">{formatMoney(item.finalSalary)}</span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {!item.isLocked && (
                          <>
                            <button className="action-btn" title="Chỉnh sửa" onClick={() => {
                              setEditingPayroll({ userId: item.userId, name: item.name, allowance: item.allowance || 0, deduction: item.deduction || 0 });
                              setIsPayrollEditModalOpen(true);
                            }}>
                              <Edit size={18} />
                            </button>
                            <button className="action-btn delete" title="Xóa" onClick={() => handleDeletePayroll(item.userId, item.name)}>
                              <span style={{color: 'red'}}>X</span>
                            </button>
                          </>
                        )}
                        {item.isLocked && (
                          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>Đã chốt</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="table-footer">
          <div className="table-info">Hiển thị 10 trong 540 bản ghi</div>
          <div className="pagination">
            <button className="page-btn text" title="Trước">
              <ChevronLeft size={16} />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn text" title="Tiếp">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isEmployeeListModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: 800, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, color: '#111827' }}>Danh sách cấu hình lương nhân viên</h2>
              <button onClick={() => setIsEmployeeListModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}>&times;</button>
            </div>
            
            <table className="salary-table">
              <thead>
                <tr>
                  <th>NHÂN VIÊN</th>
                  <th>VỊ TRÍ</th>
                  <th>MỨC LƯƠNG/H</th>
                  <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {salaryConfigs.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Chưa có cấu hình lương nào.</td></tr>
                ) : (
                  salaryConfigs.map(item => {
                    const emp = getUserDetails(item.userId);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="employee-cell">
                            <span className="emp-name">{emp.fullName || `Nhân viên #${item.userId}`}</span>
                            <span className="emp-role">{emp.email}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, color: '#374151' }}>{item.position}</td>
                        <td style={{ fontWeight: 500, color: '#374151' }}>{formatMoney(item.salaryPerHour)} VNĐ</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn" title="Chỉnh sửa" onClick={() => {
                                handleEdit(item);
                                setIsEmployeeListModalOpen(false);
                            }}>
                              <Edit size={18} />
                            </button>
                            <button className="action-btn delete" title="Xóa" onClick={() => handleDelete(item.id)}>
                              <span style={{color: 'red'}}>X</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isPayrollEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: 400, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 20, color: '#111827' }}>Sửa thông tin thực nhận</h2>
              <button onClick={() => setIsPayrollEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#6b7280' }}>&times;</button>
            </div>
            <p style={{ marginBottom: 16, fontWeight: 500 }}>Nhân viên: {editingPayroll.name}</p>
            <form onSubmit={handleEditPayrollSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>Phụ cấp (VNĐ)</label>
                <input 
                  type="number" 
                  value={editingPayroll.allowance} 
                  onChange={e => setEditingPayroll({...editingPayroll, allowance: e.target.value})}
                  className="form-control"
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>Khấu trừ (VNĐ)</label>
                <input 
                  type="number" 
                  value={editingPayroll.deduction} 
                  onChange={e => setEditingPayroll({...editingPayroll, deduction: e.target.value})}
                  className="form-control"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsPayrollEditModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{ background: 'white', padding: 32, borderRadius: 16, width: 400, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ background: '#fee2e2', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span style={{ color: '#ef4444', fontSize: 32, fontWeight: 'bold' }}>!</span>
              </div>
              <h2 style={{ margin: 0, fontSize: 20, color: '#111827' }}>Xác nhận xóa</h2>
              <p style={{ marginTop: 12, color: '#4b5563', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa dữ liệu lương tháng {selectedMonth}/{selectedYear} của nhân viên <strong style={{color: '#111827'}}>{payrollToDelete?.name}</strong> không?
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '10px 24px' }}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setPayrollToDelete(null);
                }}
              >
                Hủy
              </button>
              <button 
                className="btn" 
                style={{ background: '#ef4444', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                onClick={confirmDeletePayroll}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
};

export default SalaryConfigPage;
