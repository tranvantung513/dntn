import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, ShieldCheck, HeadphonesIcon, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../../api/cartApi';
import { menuItemApi } from '../../api/menuItemApi';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import './CustomerCartPage.css';

const CustomerCartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const { refreshCartCount, getGuestCart, saveGuestCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [productsInfo, setProductsInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Để block UI khi đang tăng/giảm đồ
  const [showClearConfirm, setShowClearConfirm] = useState(false); // State hiển thị Modal xác nhận sửa giỏ hàng
  
  const toast = useToast();
  const navigate = useNavigate();

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        const res = await cartApi.getCart();
        let rawCart = res.data?.data || res.data?.content || res.data || [];
        if (!Array.isArray(rawCart)) {
          if (rawCart.items) rawCart = rawCart.items;
          else if (rawCart.cartItems) rawCart = rawCart.cartItems;
          else rawCart = [];
        }
        setCartItems(rawCart);
      } else {
        const guestCart = getGuestCart();
        // Cấu trúc lại để giao diện hiển thị cho mượt
        const displayCart = guestCart.map(item => ({
          ...item,
          name: item.product?.name || `Sản phẩm #${item.productId}`,
          price: item.product?.price || 0,
          thumbnail: item.product?.thumbnail || ''
        }));
        setCartItems(displayCart);
      }
      setProductsInfo({});
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng", err);
      // Không báo lỗi quá gắt ở đây vì guest user có thể chưa có session cart
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setProcessingId(productId);
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        await cartApi.updateItemQuantity(productId, { quantity: newQuantity });
      } else {
        const cart = getGuestCart();
        const item = cart.find(x => x.productId === productId);
        if (item) item.quantity = newQuantity;
        saveGuestCart(cart);
      }
      
      // Cập nhật local state nhanh gọn (Optimistic UI)
      setCartItems(prev => prev.map(item => {
        const id = item.productId || item.menuItemId || item.id;
        if (id === productId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      }));
      refreshCartCount();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi cập nhật số lượng!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      if (!productId || productId === 'undefined') {
        toast.error(`❌ Lỗi Dev: Product ID bị lỗi (${productId})`);
        return;
      }
      setProcessingId(productId);
      
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        await cartApi.removeItem(productId);
      } else {
        let cart = getGuestCart();
        cart = cart.filter(x => x.productId !== productId);
        saveGuestCart(cart);
      }
      
      setCartItems(prev => {
        return prev.filter(item => {
          const id = item.productId || item.menuItemId || item.id;
          return id !== productId;
        });
      });
      refreshCartCount();
      toast.success("Đã xoá sản phẩm.");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xoá sản phẩm khỏi giỏ hàng.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearCartClick = () => {
    setShowClearConfirm(true);
  };

  const executeClearCart = async () => {
    try {
      setShowClearConfirm(false);
      setProcessingId('clear-all');
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        await cartApi.clearCart();
      } else {
        saveGuestCart([]);
      }
      setCartItems([]);
      refreshCartCount();
      toast.success("Đã làm trống giỏ hàng!");
    } catch (err) {
      console.error("Lỗi xóa toàn bộ giỏ hàng:", err);
      toast.error("Không thể xóa toàn bộ giỏ hàng lúc này.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN').format(val || 0) + ' VNĐ';
  };

  // Tính toán Tạm tính
  const calculateSubTotal = () => {
    return cartItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  };

  const formatImageUrl = (url) => {
    if (!url) return 'https://placehold.co/100?text=Food';
    if (url.startsWith('http')) return url;
    return `http://103.82.24.142:9090${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subTotal = calculateSubTotal();
  // Bỏ qua Thuế (theo yêu cầu), VAT có chăng chỉ hiển thị hoặc cộng vào Total tuỳ chỉnh
  const shippingFee = 0; // Giả sử freeship
  const totalAmount = subTotal + shippingFee;

  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        
        <div className="cart-main">
          <div className="cart-header">
            <h1>Giỏ hàng</h1>
            <div className="cart-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="cart-count-text">{totalQuantity} Sản phẩm</span>
              {cartItems.length > 0 && (
                <button 
                  onClick={handleClearCartClick}
                  disabled={processingId === 'clear-all'}
                  style={{
                    background: 'none', border: 'none', color: '#ef4444', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', 
                    gap: '5px', fontSize: '14px', padding: '5px 10px',
                    borderRadius: '5px', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Trash2 size={16} />
                  <span>Xóa tất cả</span>
                </button>
              )}
            </div>
          </div>

          <div className="cart-item-list">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                Đang tải giỏ hàng...
              </div>
            ) : cartItems.length === 0 ? (
              <div className="empty-cart-message">
                <p>Giỏ hàng của bạn đang trống.</p>
                <Link to="/products" className="continue-shopping">
                  <ArrowLeft size={16} /> Bắt đầu mua sắm
                </Link>
              </div>
            ) : (
              <>
                {cartItems.map((item, index) => {
                  const id = item.productId || item.menuItemId || item.id;
                  
                  // Lấy tên/giá/hình ảnh (trực tiếp từ response Cart)
                  const name = item.name || `Sản phẩm ID #${id}`;
                  const price = item.price || 0;
                  const originalPrice = item.originalPrice || price; // Gỉa lập nếu có giá gốc
                  // Rút mọi hình ảnh thử
                  const imageSrc = item.thumbnail || item.imageUrl || item.image || item.picture || null;
                  const imageUrl = formatImageUrl(imageSrc);

                  const isProcessing = processingId === id;

                  return (
                    <div className={`cart-item-card ${isProcessing ? 'processing' : ''}`} key={id || index}>
                      <div className="cart-item-image-wrapper">
                        <img src={imageUrl} alt={name} className="cart-item-image" />
                      </div>
                      
                      <div className="cart-item-details">
                        <div className="cart-item-top">
                          <div className="cart-item-info">
                            <h3 className="cart-item-title">{name}</h3>
                            <p className="cart-item-variant">Món ăn đặc trưng</p>
                          </div>
                          <button 
                            className="cart-delete-btn" 
                            onClick={() => handleRemoveItem(id)}
                            disabled={isProcessing}
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="cart-item-bottom">
                          <div className="quantity-control">
                            <button 
                              className="qty-btn" 
                              onClick={() => handleUpdateQuantity(id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isProcessing}
                            >
                              -
                            </button>
                            <span className="qty-value">{item.quantity}</span>
                            <button 
                              className="qty-btn" 
                              onClick={() => handleUpdateQuantity(id, item.quantity + 1)}
                              disabled={isProcessing}
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="cart-item-pricing">
                            {originalPrice > price && (
                              <div className="cart-item-price-old">{formatCurrency(originalPrice * item.quantity)}</div>
                            )}
                            <div className="cart-item-price-current">{formatCurrency(price * item.quantity)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="continue-shopping-wrapper">
                  <Link to="/products" className="continue-shopping">
                    <ArrowLeft size={16} /> Tiếp tục mua sắm
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="cart-sidebar">
          <div className="summary-card">
            <h2>Tóm tắt đơn hàng</h2>
            
            <div className="summary-rows">
              <div className="summary-row">
                <span className="summary-label">Tạm tính ({totalQuantity} sản phẩm)</span>
                <span className="summary-value">{formatCurrency(subTotal)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Phí vận chuyển dự kiến</span>
                <span className="summary-value text-green">Miễn phí</span>
              </div>
            </div>

            <div className="summary-total-section">
              <div className="summary-total-row">
                <span className="total-label">Tổng cộng</span>
                <div className="total-value-wrapper">
                  <span className="total-value">{formatCurrency(totalAmount)}</span>
                  <span className="total-vat-note">Chưa bao gồm VAT (Tạm ẩn)</span>
                </div>
              </div>
            </div>

            <button 
              className="checkout-btn" 
              disabled={cartItems.length === 0}
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Vui lòng đăng nhập để tiến hành thanh toán!');
                  navigate('/login', { state: { from: '/checkout' } });
                } else {
                  navigate('/checkout');
                }
              }}
            >
              Tiến hành thanh toán
            </button>
            <div className="checkout-secure-note">
              <ShieldCheck size={14} />
              <span>Thanh toán an toàn</span>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Confirmation Modal cho việc Xóa tất cả */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: '#fff', padding: '30px', borderRadius: '15px',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ color: '#ef4444', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
              <AlertTriangle size={48} />
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: '20px', color: '#1f2937' }}>Làm trống giỏ hàng?</h2>
            <p style={{ margin: '0 0 25px', color: '#6b7280', fontSize: '15px', lineHeight: '1.5' }}>
              Bạn có chắc chắn muốn bỏ tất cả các món ăn đã chọn không? Thao tác này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '10px 20px', background: '#f3f4f6', color: '#4b5563',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '600', flex: 1
                }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={executeClearCart}
                style={{
                  padding: '10px 20px', background: '#ef4444', color: '#fff',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '600', flex: 1
                }}
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Trusted Badges Area */}
      <div className="cart-trusted-footer">
        <div className="trusted-icons">
          <ShieldCheck size={20} />
          <HeadphonesIcon size={20} />
        </div>
        <p>© 2026 Saffron Harvest. Bảo lưu mọi quyền. Được xây dựng cho sự thanh lịch và tốc độ.</p>
      </div>
    </div>
  );
};

export default CustomerCartPage;
