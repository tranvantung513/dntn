import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ChevronRight, ChevronLeft } from 'lucide-react';
import { menuItemApi } from '../../api/menuItemApi';
import CustomerProductCard from '../../components/customer/CustomerProductCard';
import CustomerProductModal from '../../components/customer/CustomerProductModal';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { cartApi } from '../../api/cartApi';
import { recommendApi } from '../../api/recommendApi';
import { useAuth } from '../../contexts/AuthContext';
import './CustomerHomePage.css';

const CustomerHomePage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();
  const { addToCartContext } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const sliderRef = useRef(null);
  const recommendSliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const [canRecommendScrollLeft, setCanRecommendScrollLeft] = useState(false);
  const [canRecommendScrollRight, setCanRecommendScrollRight] = useState(false);

  const [recommendItems, setRecommendItems] = useState([]);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const checkRecommendScroll = () => {
    if (recommendSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = recommendSliderRef.current;
      setCanRecommendScrollLeft(scrollLeft > 0);
      setCanRecommendScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [featuredItems]);

  useEffect(() => {
    checkRecommendScroll();
  }, [recommendItems]);

  const handleScrollLeft = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: -310, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: 310, behavior: 'smooth' });
  };

  const handleRecommendScrollLeft = () => {
    if (recommendSliderRef.current) recommendSliderRef.current.scrollBy({ left: -310, behavior: 'smooth' });
  };

  const handleRecommendScrollRight = () => {
    if (recommendSliderRef.current) recommendSliderRef.current.scrollBy({ left: 310, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated]);

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommend(true);
      const res = await recommendApi.getRecommendations();
      let items = res.data?.data || res.data?.content || res.data || [];
      if (!Array.isArray(items)) items = [];
      setRecommendItems(items);
    } catch (err) {
      console.error("Lỗi lấy danh sách gợi ý:", err);
    } finally {
      setLoadingRecommend(false);
    }
  };

  const fetchFeaturedItems = async () => {
    try {
      setLoading(true);
      // Gọi fetch tất cả món (hoặc một page lớn) rồi lọc ra nổi bật
      const res = await menuItemApi.getAll({ size: 100 });
      let items = res.data?.data || res.data?.content || res.data?.result || res.data || [];
      if (!Array.isArray(items)) items = [];

      // Lọc các món có cờ nổi bật (isFeatured hoặc featured = true)
      const featured = items.filter(item => item.isFeatured === true || item.featured === true);

      // Hiển thị tất cả món nổi bật để cho phép lướt
      setFeaturedItems(featured);
    } catch (err) {
      console.error("Lỗi lấy danh sách nổi bật:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalAddToCart = async (item, qty) => {
    try {
      await addToCartContext(item, qty);
      toast.success(`Đã thêm món "${item.name}" vào giỏ hàng!`);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || `Thêm món "${item.name}" thất bại!`);
    }
  };

  return (
    <div className="home-container">
      {/* 1. HERO BANNER */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-pill">
            <ChefHat size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            MÓN NGON MỖI NGÀY
          </div>
          <h1 className="hero-title">
            Thưởng Thức Nghệ Thuật <span className="text-orange-glow">Ẩm Thực</span> Thượng Hạng
          </h1>
          <p className="hero-desc">
            Trải nghiệm những món ăn đặc trưng, được chế biến từ nguyên liệu hữu cơ địa phương với tất cả niềm đam mê.
          </p>
          <div className="hero-actions">
            <button className="btn-header-primary" onClick={() => navigate('/booking')}>Đặt bàn ngay</button>
            <button className="btn-header-outline" onClick={() => navigate('/products')}>Xem thực đơn</button>
          </div>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section className="featured-section" style={{ paddingBottom: '0' }}>
        <div className="featured-header">
          <h2>Dành cho bạn</h2>
          <p>Gợi ý những món ăn phù hợp với sở thích của bạn</p>
        </div>

        {loadingRecommend ? (
          <div className="loading-home">Đang tải gợi ý món ngon...</div>
        ) : recommendItems.length > 0 ? (
          <div className="carousel-container">
            {canRecommendScrollLeft && (
              <button className="carousel-btn btn-left" onClick={handleRecommendScrollLeft} title="Lướt trái">
                <ChevronLeft size={24} />
              </button>
            )}
            
            <div className="featured-grid" ref={recommendSliderRef} onScroll={checkRecommendScroll}>
              {recommendItems.map(item => (
                <div className="slider-item" key={`rec-${item.id}`}>
                  <CustomerProductCard
                    item={{ ...item, onViewDetails: (p) => setSelectedProduct(p) }}
                  />
                </div>
              ))}
            </div>

            {canRecommendScrollRight && (
              <button className="carousel-btn btn-right" onClick={handleRecommendScrollRight} title="Lướt phải">
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        ) : (
          <div className="empty-home">
            Hãy đặt món để chúng tôi có thể hiểu thêm về sở thích của bạn nhé!
          </div>
        )}
      </section>

      {/* 2. FEATURED FOOD (MÓN ĂN NỔI BẬT) */}
      <section className="featured-section">
        <div className="featured-header">
          <h2>Món ăn nổi bật</h2>
          <p>Những sáng tạo ẩm thực được yêu thích nhất trong tuần</p>
        </div>

        {loading ? (
          <div className="loading-home">Đang tải hương vị đặc biệt...</div>
        ) : featuredItems.length > 0 ? (
          <div className="carousel-container">
            {canScrollLeft && (
              <button className="carousel-btn btn-left" onClick={handleScrollLeft} title="Lướt trái">
                <ChevronLeft size={24} />
              </button>
            )}
            
            <div className="featured-grid" ref={sliderRef} onScroll={checkScroll}>
              {featuredItems.map(item => (
                <div className="slider-item" key={item.id}>
                  <CustomerProductCard
                    item={{ ...item, onViewDetails: (p) => setSelectedProduct(p) }}
                  />
                </div>
              ))}
            </div>

            {canScrollRight && (
              <button className="carousel-btn btn-right" onClick={handleScrollRight} title="Lướt phải">
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        ) : (
          <div className="empty-home">
            Chưa có món ăn nào được chọn làm nổi bật hôm nay.
          </div>
        )}
      </section>

      {/* 3. MODAL (Khi người dùng bấm vào card) */}
      {selectedProduct && (
        <CustomerProductModal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleModalAddToCart}
        />
      )}
    </div>
  );
};

export default CustomerHomePage;
