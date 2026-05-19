import React, { useState, useEffect } from 'react';
import { 
  Search, Download, Plus, Eye, Edit2, Trash2, 
  CheckSquare, Clock, Package, X, User, MapPin, 
  CreditCard, Phone, ListOrdered, CheckCircle2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { useToast } from '../contexts/ToastContext';
import './OrderPage.css';

const OrderPage = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState(''); // Dạng 'YYYY-MM'

  // Pagination states (client-side for now)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Edit Form State
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrders();
      let data = res.data?.data || res.data?.content || res.data || [];
      // Sort newest first
      data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (order, edit = false) => {
    try {
      // Gọi API lấy detail phòng khi list ở ngoài thiếu items
      const res = await orderApi.getOrderById(order.id);
      const detail = res.data?.data || res.data?.content || res.data || order;
      setSelectedOrder(detail);
      setNewStatus(detail.status?.toUpperCase() || 'PENDING');
      setNewPaymentStatus(detail.paymentStatus?.toUpperCase() || 'UNPAID');
      setEditMode(edit);
      setShowModal(true);
    } catch (e) {
      toast.error('Không thể tải chi tiết đơn hàng!');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrder = async () => {
    setIsUpdating(true);
    try {
      const oldSt = selectedOrder.status?.toUpperCase() || 'PENDING';
      const oldPs = selectedOrder.paymentStatus?.toUpperCase() || 'UNPAID';

      let statusMsg = '';
      if (newStatus !== oldSt) {
        await orderApi.updateOrderStatus(selectedOrder.id, newStatus);
        statusMsg += ' Trạng thái đơn.';
      }
      
      if (newPaymentStatus !== oldPs) {
        try {
          await orderApi.updatePaymentStatus(selectedOrder.id, newPaymentStatus);
          statusMsg += ' Thanh toán.';
        } catch (paymentErr) {
          toast.error('Lỗi API Thanh toán: ' + (paymentErr.response?.data?.message || paymentErr.message));
          throw paymentErr; // Ngắt luồng luôn để không báo success ảo
        }
      }

      toast.success('Cập nhật thành công!' + statusMsg);
      setShowModal(false);
      fetchOrders(); // Refresh list sau khi update
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật đơn hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInlineStatusUpdate = async (orderId, newStatus) => {
    const previousOrders = [...orders];
    // Optimistic update
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      toast.success('Cập nhật trạng thái thành công!');
    } catch (e) {
      setOrders(previousOrders); // Revert
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleInlinePaymentUpdate = async (orderId, newPaymentStatus) => {
    const previousOrders = [...orders];
    // Optimistic update
    setOrders(orders.map(o => o.id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
    try {
      await orderApi.updatePaymentStatus(orderId, newPaymentStatus);
      toast.success('Cập nhật thanh toán thành công!');
    } catch (e) {
      setOrders(previousOrders); // Revert
      toast.error('Lỗi khi cập nhật thanh toán');
    }
  };

  const statusConfigs = {
    'PENDING': { label: 'CHỜ XÁC NHẬN' },
    'CONFIRMED': { label: 'ĐÃ XÁC NHẬN' },
    'IN_PROGRESS': { label: 'ĐANG XỬ LÝ' },
    'READY': { label: 'ĐANG GIAO' },
    'COMPLETED': { label: 'ĐÃ GIAO' },
    'CANCELLED': { label: 'ĐÃ HỦY' }
  };

  const paymentStatusConfigs = {
    'UNPAID': { label: 'CHỜ THANH TOÁN' },
    'PAID': { label: 'ĐÃ THANH TOÁN' },
    'FAILED': { label: 'THẤT BẠI' },
    'REFUNDED': { label: 'HOÀN TIỀN' }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN');
    return `${time} - ${date}`;
  };

  // Lọc dữ liệu theo tab và search
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.receiverName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.receiverPhone || '').includes(searchQuery) ||
      (order.user?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user?.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.id || '').toString().includes(searchQuery);

    if (!matchesSearch) return false;

    // Lọc theo tháng
    if (filterMonth && order.createdAt) {
      const orderDate = new Date(order.createdAt);
      const orderMonthStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      if (orderMonthStr !== filterMonth) return false;
    }

    const st = order.status?.toUpperCase() || '';
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return st === 'PENDING';
    if (activeTab === 'CONFIRMED') return st === 'CONFIRMED';
    if (activeTab === 'IN_PROGRESS') return st === 'IN_PROGRESS';
    if (activeTab === 'READY') return st === 'READY';
    if (activeTab === 'COMPLETED') return st === 'COMPLETED';
    if (activeTab === 'CANCELLED') return st === 'CANCELLED';
    return true;
  });

  // Calculate stats
  const totalOrders = orders.length;
  const processingOrders = orders.filter(o => {
     const st = o.status?.toUpperCase() || '';
     return ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(st);
  }).length;
  const completedOrders = orders.filter(o => o.status?.toUpperCase() === 'COMPLETED').length;

  // Phân trang
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentData = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button 
            key={i} 
            className={`page-btn ${currentPage === i ? 'active' : ''}`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(<span key={i} className="page-btn dots">...</span>);
      }
    }
    return pages;
  };

  return (
    <>
      {/* HEADER TOP */}
      <div className="header-top">
        <div className="page-title-area">
          <h1>Quản lý Đơn hàng</h1>
        </div>
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="filter-box" style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 12px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500, marginRight: '8px' }}>Tháng:</span>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
              style={{ border: 'none', outline: 'none', padding: '8px 0', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', color: '#111827', fontWeight: 500 }}
            />
          </div>
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm đơn hàng..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="order-page" style={{ padding: '0 40px 40px', marginTop: '32px' }}>

      <div className="dashboard-cards" style={{ marginTop: 0, marginBottom: 24, padding: 0 }}>
        <div className="stat-card-horizontal">
          <div className="stat-icon-circle orange" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <ListOrdered size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Tổng đơn hàng</div>
            <div className="stat-number">{totalOrders.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-circle" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Đang xử lý</div>
            <div className="stat-number">{processingOrders.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card-horizontal">
          <div className="stat-icon-circle green" style={{ background: '#d1fae5', color: '#10b981' }}>
            <CheckSquare size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Đã giao</div>
            <div className="stat-number">{completedOrders.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="table-section">
        <div className="table-tabs-header">
          <div className="tabs-list">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ xác nhận' },
            { id: 'CONFIRMED', label: 'Đã xác nhận' },
            { id: 'IN_PROGRESS', label: 'Đang xử lý' },
            { id: 'READY', label: 'Đang giao' },
            { id: 'COMPLETED', label: 'Đã giao' },
            { id: 'CANCELLED', label: 'Đã hủy' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th colSpan="2">KHÁCH HÀNG</th>
                  <th>NGÀY ĐẶT</th>
                  <th>TỔNG TIỀN</th>
                  <th>PHƯƠNG THỨC TT</th>
                  <th>TRẠNG THÁI</th>
                  <th>THANH TOÁN</th>
                  <th style={{ textAlign: 'right' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Không tìm thấy đơn hàng nào.</td></tr>
                ) : (
                  currentData.map(order => {
                    const getInitials = (name) => {
                      if (!name) return 'KH';
                      const p = name.trim().split(' ');
                      return (p[0][0] + (p.length > 1 ? p[p.length-1][0] : '')).toUpperCase();
                    };
                    return (
                    <tr key={order.id}>
                      <td colSpan="2">
                        <div className="customer-cell">
                          <div className="customer-avatar">{getInitials(order.receiverName)}</div>
                          <div className="customer-info-detail">
                            <span className="customer-name">{order.receiverName}</span>
                            <span className="customer-phone">{order.receiverPhone}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="datetime-cell">
                          <span className="date-text">{formatDate(order.createdAt).split(' - ')[1]}</span>
                          <span className="time-text">{formatDate(order.createdAt).split(' - ')[0]}</span>
                        </div>
                      </td>
                      <td className="order-total">{formatPrice(order.totalAmount)}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#475569', fontSize: '13px' }}>
                          {order.paymentMethod === 'BANK_TRANSFER' ? 'NGÂN HÀNG' : order.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <select 
                          className={`status-pill inline-select ${order.status?.toUpperCase()}`}
                          value={order.status?.toUpperCase()}
                          onChange={(e) => handleInlineStatusUpdate(order.id, e.target.value)}
                        >
                          {Object.keys(statusConfigs).map(key => (
                              <option key={key} value={key}>{statusConfigs[key].label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select 
                          className={`status-pill payment-badge inline-select ${order.paymentStatus?.toUpperCase() || 'UNPAID'}`}
                          value={order.paymentStatus?.toUpperCase() || 'UNPAID'}
                          onChange={(e) => handleInlinePaymentUpdate(order.id, e.target.value)}
                        >
                          {Object.keys(paymentStatusConfigs).map(key => (
                              <option key={key} value={key}>{paymentStatusConfigs[key].label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                          <button className="res-cancel-icon-btn" onClick={() => handleOpenModal(order, false)}><Eye size={16}/></button>
                          <button className="res-cancel-icon-btn" onClick={() => handleOpenModal(order, true)}><Edit2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {filteredOrders.length > 0 && (
              <div className="pagination">
                <div className="pagination-text">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trên {filteredOrders.length} đơn hàng
                </div>
                <div className="pagination-controls">
                  <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                     <ChevronLeft size={16} />
                  </button>
                  {renderPagination()}
                  <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                     <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL CHI TIẾT & SỬA */}
      {showModal && selectedOrder && (
        <div className="order-modal-overlay" onClick={handleCloseModal}>
          <div className="order-modal-body" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Cập nhật đơn hàng' : 'Chi tiết đơn hàng'} #{selectedOrder.id}</h2>
              <button className="close-btn" onClick={handleCloseModal}><X size={24}/></button>
            </div>
            
            <div className="modal-content">
              <div className="detail-grid">
                {/* Thông tin khách hàng */}
                <div className="detail-card">
                  <h3><User size={18}/> Thông tin khách hàng</h3>
                  <div className="detail-row"><span>Họ Tên:</span><span>{selectedOrder.receiverName}</span></div>
                  <div className="detail-row"><span>Số điện thoại:</span><span>{selectedOrder.receiverPhone}</span></div>
                  {selectedOrder.receiverEmail && (
                    <div className="detail-row"><span>Email:</span><span>{selectedOrder.receiverEmail}</span></div>
                  )}
                  {selectedOrder.shippingAddress && (
                    <div className="detail-row" style={{ flexDirection: 'column', gap: '4px' }}>
                      <span><MapPin size={14} style={{ display: 'inline', marginRight: 4 }}/>Địa chỉ giao hàng:</span>
                      <span style={{ lineHeight: '1.4' }}>{selectedOrder.shippingAddress}</span>
                    </div>
                  )}
                </div>

                {/* Thông tin thanh toán & Trạng thái */}
                <div className="detail-card">
                  <h3><CreditCard size={18}/> Thanh toán & Trạng thái</h3>
                  <div className="detail-row"><span>Phương thức:</span><span>{selectedOrder.paymentMethod}</span></div>
                  
                  {editMode ? (
                    <>
                       <div className="detail-row" style={{ flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          <span>Trạng thái đơn hàng:</span>
                          <select 
                            className="select-control"
                            value={newStatus} 
                            onChange={e => setNewStatus(e.target.value)}
                          >
                             {Object.keys(statusConfigs).map(key => (
                               <option key={key} value={key}>{statusConfigs[key].label}</option>
                             ))}
                          </select>
                       </div>
                       
                       <div className="detail-row" style={{ flexDirection: 'column', gap: '8px' }}>
                          <span>Trạng thái thanh toán:</span>
                          <select 
                            className="select-control"
                            value={newPaymentStatus} 
                            onChange={e => setNewPaymentStatus(e.target.value)}
                          >
                             {Object.keys(paymentStatusConfigs).map(key => (
                               <option key={key} value={key}>{paymentStatusConfigs[key].label}</option>
                             ))}
                          </select>
                       </div>
                    </>
                  ) : (
                    <>
                      <div className="detail-row">
                        <span>Trạng thái đơn:</span>
                        <span className={`status-pill ${selectedOrder.status?.toUpperCase()}`}>{statusConfigs[selectedOrder.status?.toUpperCase()]?.label || selectedOrder.status}</span>
                      </div>
                      <div className="detail-row">
                        <span>Trạng thái TT:</span>
                        <span className={`status-pill payment-badge ${selectedOrder.paymentStatus?.toUpperCase() || 'UNPAID'}`}>{paymentStatusConfigs[selectedOrder.paymentStatus?.toUpperCase() || 'UNPAID']?.label || selectedOrder.paymentStatus}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {selectedOrder.note && (
                <div style={{ padding: '16px', background: '#fefce8', borderRadius: '12px', marginBottom: '24px', color: '#854d0e', fontSize: '14px' }}>
                  <strong>Ghi chú đơn hàng: </strong> {selectedOrder.note}
                </div>
              )}

              {/* Danh sách món ăn */}
              <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20}/> Chi tiết món ăn
              </h3>
              <div className="order-items-list">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <div className="item-name">
                        {item.menuItemName}
                        {item.note && <div className="item-note">Ghi chú: {item.note}</div>}
                      </div>
                      <div className="item-qty">x {item.quantity}</div>
                      <div className="item-total">{formatPrice(item.totalPrice)}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>Chưa có chi tiết sản phẩm</div>
                )}
                
                {/* Tổng tiền block */}
                <div style={{ background: '#f8fafc', padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <div className="detail-row"><span>Tạm tính:</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                  <div className="detail-row"><span>Phí ship:</span><span>{formatPrice(selectedOrder.shippingFee)}</span></div>
                  <div className="detail-row"><span>Giảm giá:</span><span style={{ color: '#10b981' }}>- {formatPrice(selectedOrder.discountAmount)}</span></div>
                  <div className="detail-row" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', fontSize: '18px' }}>
                    <span>Tổng cộng:</span><span style={{ color: '#d97706', fontWeight: 700 }}>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

            </div>
            
            {editMode && (
              <div className="modal-footer">
                <button onClick={handleCloseModal} style={{ padding: '10px 20px', border: '1px solid #d1d5db', background: 'white', borderRadius: '10px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Hủy bỏ</button>
                <button onClick={handleUpdateOrder} disabled={isUpdating} style={{ padding: '10px 20px', border: 'none', background: '#f59e0b', color: 'white', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default OrderPage;
