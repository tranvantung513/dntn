import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, Landmark, Smartphone, QrCode, Banknote, ArrowRight, ArrowLeft, CreditCard, Timer, AlertCircle } from 'lucide-react';
import { cartApi } from '../../api/cartApi';
import { discountApi } from '../../api/discountApi';
import { orderApi } from '../../api/orderApi';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './CustomerCheckoutPage.css';

const CustomerCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { refreshCartCount } = useCart();
  const { isAuthenticated, userId, loading: authLoading } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Discount States
  const [discountCode, setDiscountCode] = useState('');
  const [discountStatus, setDiscountStatus] = useState({ applied: false, amount: 0 });
  const [isApplying, setIsApplying] = useState(false);

  // Checkout Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');

  // VietQR States
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (showQrModal && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showQrModal, timeLeft]);

  useEffect(() => {
    // Nếu chưa đăng nhập, đá về trang Login và truyền đích đến là trang này
    if (!authLoading && !isAuthenticated) {
      toast.error('Vui lòng đăng nhập để truy cập trang thanh toán.');
      navigate('/login', { state: { from: '/checkout' }, replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartData();
    }
  }, [isAuthenticated]);

  const fetchCartData = async () => {
    try {
      setLoading(true);

      const reorderItems = location.state?.reorderItems;
      if (reorderItems && Array.isArray(reorderItems) && reorderItems.length > 0) {
         // Map order items to cart items format
         const mappedReorder = reorderItems.map(item => ({
            id: item.menuItemId || item.id,
            menuItemId: item.menuItemId,
            name: item.menuItemName,
            price: item.unitPrice || (item.totalPrice / item.quantity),
            quantity: item.quantity,
            thumbnail: item.imageUrl || item.thumbnail,
            note: item.note || ''
         }));
         setCartItems(mappedReorder);
         const subtotal = mappedReorder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
         setTotals({ subtotal, total: subtotal });
         setLoading(false);
         return;
      }

      // Giả sử lấy giỏ hàng tương tự CustomerCartPage
      const res = await cartApi.getCart();
      let rawCart = res.data?.data || res.data?.content || res.data || [];
      if (!Array.isArray(rawCart)) {
        if (rawCart.items) rawCart = rawCart.items;
        else if (rawCart.cartItems) rawCart = rawCart.cartItems;
        else rawCart = [];
      }
      setCartItems(rawCart);

      // Calculate totals
      const subtotal = rawCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setTotals({ subtotal, total: subtotal }); // Tạm thời total = subtotal (free ship)

    } catch (err) {
      console.error(err);
      toast.error('Lưu ý: Không thể tải được giỏ hàng kết nối!');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }

    setIsApplying(true);
    try {
      const res = await discountApi.applyDiscount(discountCode, totals.subtotal);

      // Flexible parsing of backend response
      let discountVal = 0;
      let responseBody = res.data?.data || res.data?.content || res.data;

      if (typeof responseBody === 'number' || (typeof responseBody === 'string' && !isNaN(responseBody) && responseBody.trim() !== '')) {
        // Backend MỚI trả về Tổng Tiền Chốt Hạ (Final Total) chứ KHÔNG phải số tiền giảm!
        // Ví dụ Tạm tính 3tr5, giảm 30k -> Backend trả về 3tr470
        const finalTotalFromBackend = parseFloat(responseBody);
        // Suy ra số tiền được giảm:
        discountVal = totals.subtotal - finalTotalFromBackend;
      } else if (responseBody && typeof responseBody === 'object') {
        // Xử lý nều backend trả về dạng Object { type: "PERCENTAGE", value: 10 } (như dự đoán lúc nãy)
        const type = responseBody.discountType || responseBody.type || '';
        const value = parseFloat(responseBody.discountValue || responseBody.value || responseBody.amount || 0);
        const maxDiscount = parseFloat(responseBody.maxDiscountAmount || responseBody.maxDiscount || responseBody.max_discount || 0);

        if (type === 'PERCENTAGE' || type === 'PERCENT' || type === 1) {
          discountVal = totals.subtotal * (value / 100);
          if (maxDiscount > 0 && discountVal > maxDiscount) {
            discountVal = maxDiscount;
          }
        } else if (type === 'FIXED_AMOUNT' || type === 'FIXED' || type === 2 || type === '') {
          discountVal = value;
        } else {
          discountVal = responseBody.discountAmount || responseBody.discount_amount || value;
        }
      }

      // Không cho phép giảm lố giá trị đơn hàng
      if (discountVal > totals.subtotal) discountVal = totals.subtotal;

      if (discountVal > 0) {
        setDiscountStatus({ applied: true, amount: discountVal });
        setTotals(prev => ({ ...prev, total: Math.max(0, prev.subtotal - discountVal) }));
        toast.success("Áp dụng mã giảm giá thành công!");
      } else {
        // In case backend returns 200 but discount is 0 or unparseable
        toast.error("Mã giảm giá không hợp lệ hoặc không được áp dụng!");
      }
    } catch (err) {
      console.error("Lỗi áp dụng mã:", err);

      let errorDetails = err.response?.data?.message || err.response?.data?.error || err.response?.data || err.message;
      let displayMsg = 'Mã giảm giá không hợp lệ hoặc đơn hàng chưa đạt giá trị tối thiểu.';

      // Nếu backend trả về Text có nghĩa, thì lấy text đó (độ dài vừa phải tránh HTML block)
      if (typeof errorDetails === 'string' && errorDetails.length > 0 && errorDetails.length < 150) {
        if (!errorDetails.includes('Internal Server Error') && !errorDetails.includes('500')) {
          displayMsg = errorDetails;
        }
      }

      toast.error("Lỗi: " + displayMsg);

      setDiscountStatus({ applied: false, amount: 0 });
      setTotals(prev => ({ ...prev, total: prev.subtotal }));
    } finally {
      setIsApplying(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng bắt buộc!');
      return;
    }

    try {
      // Build order items payload
      const items = cartItems.map(item => ({
        menuItemId: item.productId || item.menuItem?.id || item.menuItemId || item.id,
        menuItemName: item.name || item.menuItem?.name || `Sản phẩm #${item.productId || item.id}`,
        quantity: item.quantity,
        unitPrice: item.price || item.menuItem?.price || 0,
        discountAmount: 0,
        totalPrice: (item.price || item.menuItem?.price || 0) * item.quantity,
        note: item.note || ''
      }));

      const orderPayload = {
        receiverName: formData.fullName,
        receiverPhone: formData.phone,
        receiverEmail: formData.email || '',
        shippingAddress: formData.address,
        subtotal: totals.subtotal,
        shippingFee: 0,
        discountAmount: discountStatus.amount || 0,
        totalAmount: totals.total,
        paymentMethod: paymentMethod,
        note: '', // Ghi chú chung của đơn hàng
        userId: userId || null, // Gắn ID người dùng để BE phân loại
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        items: items
      };

      const res = await orderApi.createOrder(orderPayload);
      const newOrderId = res.data?.id || res.data?.data?.id || res.data?.orderId || res.data?.content?.id || res.data;

      if (paymentMethod === 'VIETQR' && newOrderId) {
        setCreatedOrderId(newOrderId);
        try {
          toast.info('Đang khởi tạo mã VietQR...');
          const qrRes = await orderApi.generateVietQr(newOrderId);
          setQrData(qrRes.data?.data || qrRes.data || qrRes);
          setTimeLeft(300); // 5 minutes
          setShowQrModal(true);
        } catch (e) {
          toast.error('Lỗi tạo mã QR. Đơn hàng đã ghi nhận, vui lòng thanh toán sau trong Quản lý đơn hàng.');
          try {
            if (!location.state?.reorderItems) {
               await cartApi.clearCart(); 
               refreshCartCount();
            }
          } catch (err) {}
          navigate('/');
        }
      } else {
        try {
          if (!location.state?.reorderItems) {
             await cartApi.clearCart(); 
             refreshCartCount();
          }
        } catch (e) {
          console.error("Lỗi khi xoá giỏ hàng", e);
        }
        toast.success('Đặt hàng thành công!');
        // Redirect về trang chủ
        navigate('/');
      }
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng. Vui lòng thử lại!');
    }
  };

  const handleConfirmQr = async () => {
    if (!createdOrderId) return;
    setIsConfirming(true);
    try {
      await orderApi.confirmVietQr(createdOrderId);
      
      try {
        if (!location.state?.reorderItems) {
           await cartApi.clearCart(); 
           refreshCartCount();
        }
      } catch (e) {
        console.error("Lỗi khi xoá giỏ hàng", e);
      }

      toast.success('Xác nhận thanh toán thành công! Cảm ơn bạn.');
      setShowQrModal(false);
      navigate('/');
    } catch (error) {
      toast.error('Lỗi xác nhận. Nếu bạn đã chuyển khoản, hệ thống sẽ tự cập nhật sau vài phút.');
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelQr = async () => {
    try {
      if (createdOrderId) {
        toast.info('Đang hủy giao dịch...');
        await orderApi.updateOrderStatus(createdOrderId, 'CANCELLED');
      }
    } catch (e) {
      console.error("Lỗi hủy đơn hàng", e);
    }
    setCreatedOrderId(null);
    setQrData(null);
    setShowQrModal(false);
  };

  const handleRetryQr = async () => {
    if (!createdOrderId) return;
    try {
      toast.info('Đang tạo lại mã QR...');
      const qrRes = await orderApi.generateVietQr(createdOrderId);
      setQrData(qrRes.data?.data || qrRes.data || qrRes);
      setTimeLeft(300);
    } catch (e) {
      toast.error('Vẫn không thể tạo mã QR.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + ' VNĐ';
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://103.82.24.142:9090${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (authLoading || !isAuthenticated) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Đang xác thực thông tin...</div>;
  }

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">

        <div className="checkout-header">
          <h1>Thanh toán</h1>
          <p>Hoàn tất đơn hàng của bạn bằng cách điền thông tin bên dưới.</p>
        </div>

        <div className="checkout-grid">

          {/* Left Column - Forms */}
          <div className="checkout-left">

            {/* Delivery Info */}
            <div className="checkout-section">
              <h2 className="section-title">
                <Truck className="section-icon" size={24} />
                Thông tin giao hàng
              </h2>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>HỌ VÀ TÊN</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="VD: Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>SỐ ĐIỆN THOẠI</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>ĐỊA CHỈ EMAIL (TÙY CHỌN)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group full-width">
                  <label>ĐỊA CHỈ NHẬN HÀNG</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h2 className="section-title">
                <Banknote className="section-icon" size={24} />
                Phương thức thanh toán
              </h2>

              <div className="payment-grid">

                {/* VNPAY */}
                <div
                  className={`payment-card ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('VNPAY')}
                >
                  <div className="payment-icon-wrapper icon-vnpay">
                    <Landmark size={24} />
                  </div>
                  <div className="payment-info">
                    <h4>VNPAY</h4>
                    <p>Thanh toán an toàn</p>
                  </div>
                  {paymentMethod === 'VNPAY' && <CheckCircle2 className="selected-check" size={20} />}
                </div>

                {/* VIETQR */}
                <div
                  className={`payment-card ${paymentMethod === 'VIETQR' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('VIETQR')}
                >
                  <div className="payment-icon-wrapper" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
                    <CreditCard size={24} />
                  </div>
                  <div className="payment-info">
                    <h4>Thanh toán bằng ngân hàng</h4>
                    <p>Chuyển khoản qua số tài khoản</p>
                  </div>
                  {paymentMethod === 'VIETQR' && <CheckCircle2 className="selected-check" size={20} />}
                </div>

                {/* COD */}
                <div
                  className={`payment-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="payment-icon-wrapper icon-cod">
                    <Banknote size={24} />
                  </div>
                  <div className="payment-info">
                    <h4>Tiền mặt (COD)</h4>
                    <p>Thanh toán khi nhận hàng</p>
                  </div>
                  {paymentMethod === 'COD' && <CheckCircle2 className="selected-check" size={20} />}
                </div>

              </div>
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="checkout-right">
            <div className="summary-section">
              <h3 className="summary-title">Tóm tắt đơn hàng</h3>

              <div className="summary-items">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>Đang tải...</div>
                ) : cartItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>Giỏ hàng đang trống.</div>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={index} className="summary-item" style={{ flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', width: '100%', gap: '16px', alignItems: 'center' }}>
                        <img src={getImageUrl(item.thumbnail)} alt={item.name} className="item-img" style={{ margin: 0 }} />
                        <div className="item-details" style={{ flex: 1 }}>
                          <h4>{item.name}</h4>
                          <div className="item-qty">Số lượng: {item.quantity}</div>
                          <div className="item-price">{formatPrice(item.price)}</div>
                        </div>
                      </div>
                      <div className="item-note-wrapper" style={{ width: '100%', marginTop: '4px' }}>
                        <input
                          type="text"
                          placeholder="Ghi chú món (VD: Ít cay, không hành...)"
                          value={item.note || ''}
                          onChange={(e) => {
                            const newCart = [...cartItems];
                            newCart[index].note = e.target.value;
                            setCartItems(newCart);
                          }}
                          style={{
                            width: '100%', padding: '8px 12px', fontSize: '13px',
                            border: '1px solid #e5e7eb', borderRadius: '6px',
                            background: '#f8fafc', outline: 'none', transition: 'border-color 0.2s',
                            color: '#334155'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#d97706'}
                          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="discount-area">
                <div className="discount-label">MÃ GIẢM GIÁ</div>
                <div className="discount-input-group">
                  <input
                    type="text"
                    placeholder="Nhập mã của bạn"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={discountStatus.applied}
                  />
                  {!discountStatus.applied ? (
                    <button type="button" className="btn-discount" onClick={handleApplyDiscount} disabled={isApplying}>
                      {isApplying ? 'Đang tải...' : 'Áp dụng'}
                    </button>
                  ) : (
                    <button type="button" className="btn-discount" style={{ background: '#ef4444' }} onClick={() => {
                      setDiscountStatus({ applied: false, amount: 0 });
                      setTotals(prev => ({ ...prev, total: prev.subtotal }));
                      setDiscountCode('');
                    }}>
                      Hủy bỏ
                    </button>
                  )}
                </div>
              </div>

              <div className="calc-row">
                <span className="label">Tạm tính</span>
                <span className="value">{formatPrice(totals.subtotal)}</span>
              </div>

              {discountStatus.applied && discountStatus.amount > 0 && (
                <div className="calc-row text-green" style={{ color: '#10b981' }}>
                  <span className="label" style={{ color: '#10b981' }}>Giảm giá</span>
                  <span className="value">- {formatPrice(discountStatus.amount)}</span>
                </div>
              )}

              <div className="calc-row shipping">
                <span className="label">Phí vận chuyển</span>
                <span className="value">MIỄN PHÍ</span>
              </div>

              <div className="total-row">
                <span className="label">Tổng cộng</span>
                <div className="total-details">
                  <div className="total-price">{formatPrice(totals.total)}</div>
                  <div className="vat-note">ĐÃ BAO GỒM VAT</div>
                </div>
              </div>

              <button
                className="btn-submit-order"
                onClick={handleSubmitOrder}
                disabled={cartItems.length === 0}
              >
                Xác nhận đặt hàng <ArrowRight size={20} />
              </button>

              <div className="terms-note">
                Bằng việc nhấn đặt hàng, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> của Saffron Harvest.
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* VIETQR MODAL */}
      {showQrModal && (
        <div className="vietqr-modal-overlay">
          <div className="vietqr-modal">
            <div className="vietqr-header">
              <button 
                className="btn-close-qr-left"
                onClick={handleCancelQr}
              >
                <ArrowLeft size={16} /> Thoát
              </button>
              <h3>Thanh toán qua mã QR</h3>
            </div>
            
            <div className="vietqr-body">
              {qrData ? (
                <>
                  <div className="qr-wrapper">
                    <img 
                      src={
                        qrData.qrCodeBase64 
                          ? (qrData.qrCodeBase64.startsWith('data:image') ? qrData.qrCodeBase64 : `data:image/png;base64,${qrData.qrCodeBase64}`) 
                          : qrData.qrCode || qrData.image || (typeof qrData === 'string' && qrData.startsWith('data:image') ? qrData : `data:image/png;base64,${qrData}`)
                      } 
                      alt="VietQR" 
                    />
                  </div>
                  
                  <div className="qr-info">
                    <div className="info-row">
                      <span>Số tiền:</span>
                      <strong>{formatPrice(qrData.amount || totals.total)}</strong>
                    </div>
                    <div className="info-row">
                      <span>Nội dung:</span>
                      <strong>{qrData.paymentContent || `ORDER_${createdOrderId}`}</strong>
                    </div>
                    <div className="info-alert">
                      <AlertCircle size={16} />
                      <p>Vui lòng nhập đúng nội dung chuyển khoản để hệ thống ghi nhận tự động.</p>
                    </div>
                  </div>

                  <div className="qr-timer">
                    <Timer size={18} />
                    <span className={timeLeft < 60 ? 'text-red' : ''}>
                      {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                      {(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {timeLeft <= 0 ? (
                    <div className="qr-expired">
                      <p>Mã QR đã hết hạn!</p>
                      <div className="qr-actions">
                        <button className="btn-retry" onClick={handleRetryQr}>Tạo mã mới</button>
                        <button className="btn-home" onClick={() => navigate('/')}>Về trang chủ</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      className="btn-confirm-payment" 
                      onClick={handleConfirmQr}
                      disabled={isConfirming}
                    >
                      {isConfirming ? 'Đang xác nhận...' : 'Tôi đã chuyển tiền'}
                    </button>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải mã QR...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCheckoutPage;
