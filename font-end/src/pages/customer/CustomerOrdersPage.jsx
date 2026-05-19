import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { menuItemApi } from '../../api/menuItemApi';
import { MapPin, CreditCard, ShoppingBag, Receipt } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './CustomerOrdersPage.css';

const CustomerOrdersPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, userFullName, userId, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [menuImages, setMenuImages] = useState({});
  const [cancelModalOrderId, setCancelModalOrderId] = useState(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

  useEffect(() => {
    // Tải trước danh sách Món ăn để 'chữa cháy' việc API OrderItem bị mất ảnh
    const fetchMenuImages = async () => {
      try {
        const res = await menuItemApi.getAll();
        const itemsList = res.data?.data || res.data?.content || res.data || [];
        const imageMap = {};
        itemsList.forEach(i => {
           if (i.name && (i.thumbnail || i.imageUrl)) {
              imageMap[i.name.toLowerCase().trim()] = i.thumbnail || i.imageUrl;
           }
        });
        setMenuImages(imageMap);
      } catch (e) {
        console.error("Lỗi khi tải ảnh map", e);
      }
    };
    fetchMenuImages();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Vui lòng đăng nhập để xem đơn hàng.');
      navigate('/login', { state: { from: '/orders' }, replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, userId]);

  const handleRequestCancel = (orderId) => {
    setCancelModalOrderId(orderId);
  };

  const executeCancelOrder = async () => {
    if (!cancelModalOrderId) return;
    const orderId = cancelModalOrderId;
    setCancelModalOrderId(null); // Đóng modal ngay
    
    // Đánh lừa giao diện (Optimistic UI Update) để khách thấy kết quả ngay
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
    
    try {
      await orderApi.updateOrderStatus(orderId, 'CANCELLED');
      toast.success('Đã hủy đơn hàng thành công!');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi hủy đơn!');
      fetchOrders(); // Khôi phục trạng thái ban đầu nếu lỗi
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let data = [];
      let usedEndpoint = '';
      
      if (userId) {
         usedEndpoint = `api/orders/user/${userId}`;
         const res = await orderApi.getOrdersByUser(userId);
         data = res.data?.data || res.data?.content || res.data;
         if (!Array.isArray(data)) data = [];
      } else {
         usedEndpoint = `api/orders`;
         const res = await orderApi.getOrders();
         data = res.data?.data || res.data?.content || res.data;
         if (!Array.isArray(data)) data = [];
      }
      
      if (data.length === 0) {
         const fallbackRes = await orderApi.getOrders();
         const allData = fallbackRes.data?.data || fallbackRes.data?.content || fallbackRes.data || [];
         
         if (Array.isArray(allData)) {
            const matching = allData.filter(o => {
               const matchName = o.receiverName && userFullName && o.receiverName.toLowerCase().includes(userFullName.toLowerCase());
               return matchName;
            });
            
            if (matching.length > 0) {
               data = matching;
            } else {
               toast.info(`Không tìm thấy đơn. Endpoint: ${usedEndpoint} (0 đơn). UserFullName: ${userFullName || 'null'}, UserId: ${userId || 'null'}. Tổng đơn DB: ${allData.length}`);
            }
         }
      }

      if (Array.isArray(data)) {
        data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        data = [];
      }
      
      setOrders(data);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Lỗi không xác định';
      toast.error(`Không thể tải lịch sử đơn hàng! (${msg})`);
    } finally {
      setLoading(false);
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

  const getImageUrl = (url, itemName) => {
    let finalUrl = url;
    
    // Nếu đơn hàng ko lưu ảnh, thử rà qua kho dữ liệu gốc (menuImages map)
    if (!finalUrl && itemName) {
       finalUrl = menuImages[itemName.toLowerCase().trim()];
    }

    if (!finalUrl || finalUrl === 'null' || finalUrl === 'undefined') {
       // Placeholder dự phòng thật đẹp để tránh lỗi 404 broken image icon
       return `https://ui-avatars.com/api/?name=${encodeURIComponent(itemName || 'M')}&background=random&color=fff&size=100`;
    }
    
    if (finalUrl.startsWith('http')) return finalUrl;
    return `http://103.82.24.142:9090${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + ' VNĐ';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN');
    return `${time} - ${date}`;
  };

  // Lọc dữ liệu theo tab
  const filteredOrders = orders.filter(order => {
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

  if (authLoading || !isAuthenticated) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải...</div>;

  return (
    <div className="customer-orders-wrapper">
      <div className="customer-orders-container">
        
        <div className="orders-page-header">
          <h1>Lịch sử Đơn hàng</h1>
          <p>Xem lại hành trình ẩm thực và quản lý các đơn đặt hàng của bạn.</p>
        </div>

        <div className="orders-tabs">
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
              className={`orders-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="orders-list">
          {loading ? (
             <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải lịch sử đơn hàng...</div>
          ) : filteredOrders.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
                Chưa có đơn hàng nào trong mục này.
             </div>
          ) : (
             filteredOrders.map(order => {
               const st = order.status?.toUpperCase() || 'PENDING';
               const isCancelled = st === 'CANCELLED';
               const isCompleted = st === 'COMPLETED';

               return (
                 <div key={order.id} className="customer-order-card">
                   <div className="order-card-header">
                     <div className="order-info-left">
                       <div className="order-id-group">
                         <span className={`c-status-pill ${st}`}>
                           {statusConfigs[st]?.label || st}
                         </span>
                       </div>
                       <div className="order-date">Đặt vào: {formatDate(order.createdAt)}</div>
                     </div>
                     
                     <div className="order-price-right">
                       <span className="price-label">Tổng thanh toán</span>
                       <span className={`price-value ${isCancelled ? 'cancelled' : ''}`}>
                         {formatPrice(order.totalAmount)}
                       </span>
                     </div>
                   </div>

                   <div className="order-card-body">
                     {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                           <div key={idx} className="order-item-display">
                             <img src={getImageUrl(item.imageUrl || item.thumbnail, item.menuItemName)} alt={item.menuItemName} className="order-item-img" />
                             <div className="order-item-detail">
                               <span className="order-item-name">{item.menuItemName}</span>
                               <span className="order-item-qty">Số lượng: {item.quantity < 10 ? `0${item.quantity}` : item.quantity}</span>
                             </div>
                           </div>
                        ))
                     ) : (
                        <div style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>Không có chi tiết sản phẩm.</div>
                     )}
                   </div>

                   <div className="order-card-footer">
                     {st === 'PENDING' && (
                       <button 
                         className="btn-card-action danger"
                         onClick={() => handleRequestCancel(order.id)}
                       >
                         Hủy đơn
                       </button>
                     )}
                     <button 
                       className="btn-card-action primary"
                       onClick={() => setSelectedOrderDetail(order)}
                     >
                       Chi tiết
                     </button>
                     {isCompleted && (
                       <button 
                         className="btn-card-action secondary"
                         onClick={() => {
                           const enrichedItems = order.items.map(i => ({
                             ...i,
                             thumbnail: getImageUrl(i.imageUrl || i.thumbnail, i.menuItemName)
                           }));
                           navigate('/checkout', { state: { reorderItems: enrichedItems } });
                         }}
                       >
                         Mua lại
                       </button>
                     )}
                   </div>
                 </div>
               )
             })
          )}
        </div>

        {/* CUSTOM CONFIRM MODAL */}
        {cancelModalOrderId && (
          <div className="c-confirm-modal-overlay" onClick={() => setCancelModalOrderId(null)}>
            <div className="c-confirm-modal-box" onClick={e => e.stopPropagation()}>
              <div className="c-confirm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <h3>Xác nhận Hủy đơn hàng</h3>
              <p>Bạn có chắc chắn muốn hủy đơn hàng này không?<br/>Hành động này không thể hoàn tác.</p>
              <div className="c-confirm-actions">
                <button className="c-confirm-btn cancel" onClick={() => setCancelModalOrderId(null)}>Trở lại</button>
                <button className="c-confirm-btn confirm" onClick={executeCancelOrder}>Đồng ý Hủy</button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM DETAIL MODAL */}
        {selectedOrderDetail && (
          <div className="c-confirm-modal-overlay" onClick={() => setSelectedOrderDetail(null)}>
            <div className="c-detail-modal-box" onClick={e => e.stopPropagation()}>
              
              <div className="c-detail-header">
                <h3>Chi tiết đơn hàng #{selectedOrderDetail.id}</h3>
                <button className="c-detail-close-btn" onClick={() => setSelectedOrderDetail(null)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="c-detail-body">
                
                <div className="c-detail-section">
                  <h4><MapPin size={18} color="#f59e0b"/> Thông tin Giao hàng</h4>
                  <div className="c-detail-row"><span className="label">Người nhận:</span><span className="value">{selectedOrderDetail.receiverName}</span></div>
                  <div className="c-detail-row"><span className="label">Số điện thoại:</span><span className="value">{selectedOrderDetail.receiverPhone}</span></div>
                  <div className="c-detail-row"><span className="label">Địa chỉ:</span><span className="value">{selectedOrderDetail.shippingAddress}</span></div>
                  <div className="c-detail-row"><span className="label">Ngày đặt:</span><span className="value">{formatDate(selectedOrderDetail.createdAt)}</span></div>
                </div>

                <div className="c-detail-section">
                  <h4><CreditCard size={18} color="#f59e0b"/> Trạng thái & Thanh toán</h4>
                  <div className="c-detail-row">
                    <span className="label">Trạng thái đơn:</span>
                    <span className={`c-status-pill ${selectedOrderDetail.status?.toUpperCase()}`}>
                       {statusConfigs[selectedOrderDetail.status?.toUpperCase()]?.label || selectedOrderDetail.status}
                    </span>
                  </div>
                  <div className="c-detail-row">
                    <span className="label">Thanh toán:</span>
                    <span className="value">{selectedOrderDetail.paymentMethod} - {paymentStatusConfigs[selectedOrderDetail.paymentStatus?.toUpperCase() || 'UNPAID']?.label}</span>
                  </div>
                  {selectedOrderDetail.note && (
                    <div className="c-detail-row" style={{ flexDirection: 'column', textAlign: 'left', marginTop: '12px' }}>
                      <span className="label" style={{ marginBottom: '6px' }}>Ghi chú chung:</span>
                      <span className="value" style={{ textAlign: 'left', background: '#fefce8', color: '#854d0e', padding: '12px', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>{selectedOrderDetail.note}</span>
                    </div>
                  )}
                </div>

                <div className="c-detail-section">
                  <h4><ShoppingBag size={18} color="#f59e0b"/> Danh sách Món ăn</h4>
                  <div className="c-detail-item-list">
                    {selectedOrderDetail.items && selectedOrderDetail.items.length > 0 ? (
                      selectedOrderDetail.items.map((item, idx) => (
                        <div key={idx} className="c-detail-item">
                          <img src={getImageUrl(item.imageUrl || item.thumbnail, item.menuItemName)} alt={item.menuItemName} />
                          <div className="c-detail-item-info">
                            <span className="c-detail-item-name">{item.menuItemName}</span>
                            <div className="c-detail-item-meta">
                              <span>Số lượng: {item.quantity}</span>
                              <span style={{ fontWeight: 600, color: '#f59e0b' }}>{formatPrice(item.totalPrice)}</span>
                            </div>
                            {item.note && <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Ghi chú: {item.note}</div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>Không có chi tiết sản phẩm.</div>
                    )}
                  </div>
                </div>

                <div className="c-detail-summary">
                  <div className="c-detail-row"><span className="label">Tạm tính:</span><span className="value">{formatPrice(selectedOrderDetail.subtotal)}</span></div>
                  <div className="c-detail-row"><span className="label">Phí giao hàng:</span><span className="value">{formatPrice(selectedOrderDetail.shippingFee)}</span></div>
                  <div className="c-detail-row"><span className="label">Giảm giá:</span><span className="value" style={{ color: '#059669' }}>- {formatPrice(selectedOrderDetail.discountAmount)}</span></div>
                  <div className="c-detail-row"><span className="label"><Receipt size={18} style={{verticalAlign: 'bottom', marginRight: '6px'}}/>Tổng cộng:</span><span className="value">{formatPrice(selectedOrderDetail.totalAmount)}</span></div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerOrdersPage;
