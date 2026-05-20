import React, { useState, useEffect } from 'react';
import { Copy, Calendar } from 'lucide-react';
import { discountApi } from '../../api/discountApi';
import { useToast } from '../../contexts/ToastContext';
import './CustomerPromotionsPage.css';

const CustomerPromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await discountApi.getAll();
      const rawData = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      // Lọc các chiến dịch đang hoạt động, không bị xoá, và hạn chưa kết thúc (nếu có)
      const now = new Date();
      const validPromos = rawData.filter(d => 
        d.status === true && 
        d.isDeleted !== true &&
        (!d.endDate || new Date(d.endDate) >= now)
      );
      setPromotions(validPromos);
    } catch (err) {
      console.error("Lỗi lấy ưu đãi:", err);
      toast.error("Không thể tải chương trình khuyến mãi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success("Đã sao chép mã giảm giá: " + code);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast.error("Lỗi khi sao chép mã.");
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN').format(val || 0) + 'đ';
  };

  const openPromoDetails = (promo) => {
    setSelectedPromo(promo);
  };

  const closePromoDetails = () => {
    setSelectedPromo(null);
  };

  const formatVietnameseDate = (dateStr) => {
    if (!dateStr) return 'Không thời hạn';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };



  return (
    <div className="customer-promotions-page">
      {/* Jumbotron Hero Banner */}
      <section className="promo-hero-section">
        <div className="promo-hero-overlay"></div>
        <div className="promo-hero-content">
          <h1>Chương Trình Khuyến Mãi</h1>
          <p>Khám phá những ưu đãi ẩm thực độc quyền từ Saffron Harvest dành riêng cho bạn.</p>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="promo-main-section">
        <div className="promo-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải ưu đãi...</p>
            </div>
          ) : promotions.length === 0 ? (
            <div className="empty-state">
              <p>Hiện không có chương trình khuyến mãi nào đang diễn ra.</p>
            </div>
          ) : (
            <div className="promo-grid">
              {promotions.map((promo, index) => {
                const isPercentage = promo.discountType === 0;
                // Tạo câu mô tả giả dựa trên loại giảm giá nếu DB chưa có trường description
                const description = isPercentage 
                  ? `Thưởng thức ưu đãi giảm giá ${promo.discountValue}% trên tổng hoá đơn cho thực đơn hấp dẫn.`
                  : `Nhận ngay ưu đãi giảm ${new Intl.NumberFormat('vi-VN').format(promo.discountValue)}đ cho đơn hàng đạt điều kiện tối thiểu.`;

                return (
                  <div className="promo-card" key={promo.id || index}>
                    <div className="promo-card-inner">
                      {/* Badge & Icon Area */}
                      <div className="promo-card-header">
                        <div className={`promo-badge ${isPercentage ? 'badge-yellow' : 'badge-blue'}`}>
                          {isPercentage ? `Giảm ${promo.discountValue}%` : `Giảm ${formatCurrency(promo.discountValue)}`}
                        </div>
                      </div>

                      {/* Text Content Area */}
                      <div className="promo-card-body">
                        <h3 className="promo-title">{promo.name}</h3>
                        <p className="promo-description">{description}</p>
                        
                        {/* Discount Code Box */}
                        <div className="promo-code-box">
                          <div className="code-info">
                            <span className="code-label">MÃ GIẢM GIÁ</span>
                            <span className="code-value">{promo.code}</span>
                          </div>
                          <button 
                            className="code-copy-btn"
                            onClick={() => handleCopyCode(promo.code)}
                            title="Sao chép mã"
                          >
                            <Copy size={16} />
                            <span>Sao chép mã</span>
                          </button>
                        </div>
                      </div>

                      {/* Footer Area */}
                      <div className="promo-card-footer">
                        <Calendar size={14} className="calendar-icon" />
                        <span>Hết hạn: {formatVietnameseDate(promo.endDate)}</span>
                        <button 
                          className="btn-view-promo-details"
                          onClick={() => openPromoDetails(promo)}
                        >
                          Điều kiện
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Promotion Detail Modal */}
      {selectedPromo && (
        <div className="promo-modal-overlay" onClick={closePromoDetails}>
          <div className="promo-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="promo-modal-header">
              <h2>Chi Tiết Khuyến Mãi</h2>
              <button className="promo-modal-close" onClick={closePromoDetails}>×</button>
            </div>
            <div className="promo-modal-body">
              <div className="promo-modal-info">
                <h3>{selectedPromo.name}</h3>
                <p><strong>Mã:</strong> <span className="highlight-code">{selectedPromo.code}</span></p>
                <p><strong>Loại giảm:</strong> {selectedPromo.discountType === 0 ? 'Giảm theo phần trăm' : 'Giảm số tiền cố định'}</p>
                <p>
                  <strong>Mức giảm:</strong> {selectedPromo.discountType === 0 
                    ? `${selectedPromo.discountValue}%` 
                    : formatCurrency(selectedPromo.discountValue)}
                </p>
                <p><strong>Đơn tối thiểu:</strong> {formatCurrency(selectedPromo.minOrderValue)}</p>
                {selectedPromo.discountType === 0 && selectedPromo.maxDiscountAmount > 0 && (
                  <p><strong>Giảm tối đa:</strong> {formatCurrency(selectedPromo.maxDiscountAmount)}</p>
                )}
                <p><strong>Ngày bắt đầu:</strong> {formatVietnameseDate(selectedPromo.startDate)}</p>
                <p><strong>Ngày kết thúc:</strong> {formatVietnameseDate(selectedPromo.endDate)}</p>
                <p><strong>Số lượng còn:</strong> {selectedPromo.usageLimit > 0 ? selectedPromo.usageLimit - (selectedPromo.usedCount || 0) : 'Không giới hạn'}</p>
              </div>
              <button className="btn-copy-large" onClick={() => { handleCopyCode(selectedPromo.code); closePromoDetails(); }}>
                Sao Chép Mã
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPromotionsPage;
