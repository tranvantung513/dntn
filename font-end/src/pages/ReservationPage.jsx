import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, CheckCircle2, Clock, CalendarDays, 
  Filter, X, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { bookingApi } from '../api/bookingApi';
import { useToast } from '../contexts/ToastContext';
import './ReservationPage.css';

const ReservationPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const toast = useToast();

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Create Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    people: 2,
    bookingTime: '',
    note: ''
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'ALL' ? null : activeTab;
      const data = await bookingApi.getAllBookings(statusParam);
      // Đảo ngược mảng để cái mới nhất lên đầu nếu data trả về mảng
      if (Array.isArray(data)) {
        setBookings(data.reverse());
      } else if (data.content && Array.isArray(data.content)) {
        setBookings(data.content.reverse());
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đặt bàn:", error);
      toast.error('Không thể tải danh sách đặt bàn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    setCurrentPage(1);
  }, [activeTab]);

  // Handle Create Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    // Validate số điện thoại Việt Nam (10 số, đầu 03, 05, 07, 08, 09)
    const phoneRegex = /^0[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Số điện thoại không hợp lệ! Vui lòng nhập SĐT Việt Nam (10 số).');
      return;
    }

    try {
      const payload = {
        name: formData.customerName,
        phone: formData.phone,
        people: formData.people,
        bookingTime: formData.bookingTime + ":00",
        note: formData.note
      };
      await bookingApi.createBooking(payload);
      toast.success('Tạo đặt bàn mới thành công!');
      setIsCreateModalOpen(false);
      setFormData({ customerName: '', phone: '', people: 2, bookingTime: '', note: '' });
      fetchBookings();
    } catch (error) {
      console.error("Create booking error:", error);
      toast.error(error.response?.data?.message || 'Lỗi khi tạo đặt bàn mới');
    }
  };

  // Handle Confirm
  const handleConfirm = async (id) => {
    try {
      await bookingApi.confirmBooking(id);
      toast.success('Đã xác nhận đặt bàn thành công!');
      fetchBookings();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xác nhận');
    }
  };

  // Handle Cancel
  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  const executeCancel = async () => {
    if (!selectedBooking) return;
    try {
      await bookingApi.cancelBooking(selectedBooking.id);
      toast.success('Đã huỷ đặt bàn!');
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi huỷ đặt bàn');
    }
  };

  // Formatting utils
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '', time: '' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getInitials = (name) => {
    if (!name) return 'KH';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Stats calculation
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
  };

  // Filter & Pagination
  const filteredBookings = bookings.filter(b => 
    b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.phone?.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const currentData = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      {/* HEADER TOP (Giống Khuyến mãi) */}
      <div className="header-top">
        <div className="page-title-area">
          <h1>Quản lý Đặt bàn</h1>
        </div>
        <div className="header-actions">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm khách hàng..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary inline-flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', fontWeight: '600' }} onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            Tạo Đặt Bàn Mới
          </button>
        </div>
      </div>

      <div className="reservation-page" style={{ padding: '0 40px 40px', marginTop: '32px' }}>

      {/* STATS */}
      <div className="dashboard-cards" style={{ marginTop: 0, marginBottom: 24, padding: 0 }}>
        <div className="stat-card-horizontal">
          <div className="stat-icon-circle orange" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <CalendarDays size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng đơn đặt</div>
            <div className="stat-number">{stats.total.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-circle" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Đang chờ</div>
            <div className="stat-number">{stats.pending}</div>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-circle green" style={{ background: '#d1fae5', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Đã xác nhận</div>
            <div className="stat-number">{stats.confirmed.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="table-section">
        <div className="table-tabs-header">
          <div className="tabs-list">
            <button className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`} onClick={() => setActiveTab('ALL')}>Tất cả</button>
            <button className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`} onClick={() => setActiveTab('PENDING')}>Chờ xác nhận</button>
            <button className={`tab-btn ${activeTab === 'CONFIRMED' ? 'active' : ''}`} onClick={() => setActiveTab('CONFIRMED')}>Đã xác nhận</button>
            <button className={`tab-btn ${activeTab === 'CANCELLED' ? 'active' : ''}`} onClick={() => setActiveTab('CANCELLED')}>Đã hủy</button>
          </div>
        </div>

        <table className="reservation-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th style={{ textAlign: 'center' }}>Khách</th>
              <th>Ngày & giờ</th>
              <th>Vị trí bàn (Ghi chú)</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Không tìm thấy đặt bàn nào.</td>
              </tr>
            ) : (
              currentData.map(booking => {
                const { date, time } = formatDateTime(booking.bookingTime);
                return (
                  <tr key={booking.id}>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">{getInitials(booking.customerName)}</div>
                        <div className="customer-info-detail">
                          <span className="customer-name">{booking.customerName}</span>
                          <span className="customer-phone">{booking.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="people-count">{booking.people?.toString().padStart(2, '0') || '02'}</span>
                    </td>
                    <td>
                      <div className="datetime-cell">
                        <span className="date-text">{date}</span>
                        <span className="time-text">{time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-position">
                        <div className="table-dot"></div>
                        {booking.note || 'Chưa xếp bàn'}
                      </div>
                    </td>
                    <td>
                      {booking.status === 'CONFIRMED' && <span className="status-pill status-confirmed">ĐÃ XÁC NHẬN</span>}
                      {booking.status === 'PENDING' && <span className="status-pill status-pending">CHỜ XÁC NHẬN</span>}
                      {booking.status === 'CANCELLED' && <span className="status-pill status-cancelled">ĐÃ HỦY</span>}
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        {booking.status === 'PENDING' && (
                          <button className="res-confirm-btn" onClick={() => handleConfirm(booking.id)} title="Xác nhận">
                            XÁC NHẬN
                          </button>
                        )}
                        {booking.status !== 'CANCELLED' && (
                          <button className="res-cancel-icon-btn" onClick={() => handleCancelClick(booking)} title="Hủy phiếu">
                            <X size={16} />
                          </button>
                        )}
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
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBookings.length)} trong {filteredBookings.length} kết quả
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="res-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="res-modal-content" onClick={e => e.stopPropagation()}>
            <div className="res-modal-header">
              <h2>Tạo Đặt Bàn Mới</h2>
              <button className="res-close-btn" onClick={() => setIsCreateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="res-modal-body">
                <div className="res-form-group">
                  <label>Tên khách hàng *</label>
                  <input type="text" className="res-form-control" name="customerName" required placeholder="VD: Anh Tùng..." 
                    value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} 
                  />
                </div>
                <div className="res-form-group">
                  <label>Số điện thoại *</label>
                  <input type="tel" className="res-form-control" name="phone" required placeholder="09xxxx..." 
                    value={formData.phone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({...formData, phone: val});
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="res-form-group">
                    <label>Số người</label>
                    <input type="number" className="res-form-control" name="people" min="1" required 
                      value={formData.people} onChange={e => setFormData({...formData, people: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div className="res-form-group">
                    <label>Ngày & Giờ (Dự kiến) *</label>
                    <input type="datetime-local" className="res-form-control" name="bookingTime" required 
                      value={formData.bookingTime} onChange={e => setFormData({...formData, bookingTime: e.target.value})}
                    />
                  </div>
                </div>
                <div className="res-form-group">
                  <label>Vị trí bàn & Ghi chú thêm</label>
                  <textarea className="res-form-control" name="note" placeholder="VD: Bàn 05 (Lầu 1), Cần ghế trẻ em..." 
                    value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="res-modal-footer">
                <button type="button" className="res-btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="res-btn-primary">Tạo Đặt Bàn</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {isCancelModalOpen && selectedBooking && (
        <div className="res-modal-overlay" onClick={() => setIsCancelModalOpen(false)}>
          <div className="res-modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="res-modal-header">
              <h2>Xác nhận Hủy</h2>
              <button className="res-close-btn" onClick={() => setIsCancelModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="res-modal-body">
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn hủy đặt bàn của khách <strong>{selectedBooking.customerName}</strong> không?
                Thao tác này không thể hoàn tác lại.
              </p>
            </div>
            <div className="res-modal-footer">
              <button type="button" className="res-btn-secondary" onClick={() => setIsCancelModalOpen(false)}>Quay lại</button>
              <button type="button" className="res-btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={executeCancel}>
                Đồng ý Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ReservationPage;
