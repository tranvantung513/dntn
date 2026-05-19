import React, { useState, useEffect } from 'react';
import { Calendar, Users, Info, User, Phone, CheckCircle, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { bookingApi } from '../../api/bookingApi';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import './CustomerBookingPage.css';

const CustomerBookingPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  // Date selection state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Form State
  const [people, setPeople] = useState(2);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // MOCK: Dữ liệu giờ nhận bàn (Được thiết kế để dễ dàng map từ API sau này)
  const [availableTimes, setAvailableTimes] = useState([]);

  // Khởi tạo các khung giờ từ 9:00 sáng đến 22:00 đêm
  useEffect(() => {
    const times = [];
    let id = 1;
    for (let h = 8; h <= 22; h++) {
      const period = h < 12 ? 'AM' : 'PM';
      const hStr = h.toString().padStart(2, '0');
      times.push({ id: id++, time: `${hStr}:00`, period });
    }
    setAvailableTimes(times);
  }, []);

  // Calendar Logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  // Điều chỉnh để T2 là cột đầu tiên, CN là cột cuối (0 là CN)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (d >= today) {
      setSelectedDate(d);
      setSelectedTime(null); // Reset giờ khi đổi ngày
    }
  };

  const handleTimeClick = (timeStr) => {
    setSelectedTime(timeStr);
  };

  const decreasePeople = () => setPeople(prev => Math.max(1, prev - 1));
  const increasePeople = () => setPeople(prev => Math.min(20, prev + 1));

  const formatSummaryDate = () => {
    if (!selectedDate) return 'Chưa chọn ngày';
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear();
    const timeStr = selectedTime ? ` • ${selectedTime}` : '';
    return `${day} Tháng ${month}, ${year}${timeStr}`;
  };

  const handleBooking = () => {
    if (!selectedDate) {
      toast.error('Vui lòng chọn Ngày hẹn bàn!');
      return;
    }
    if (!selectedTime) {
      toast.error('Vui lòng chọn Giờ nhận bàn!');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập Họ và Tên!');
      return;
    }
    
    const phoneRegex = /^0[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Số điện thoại không hợp lệ! Vui lòng nhập SĐT Việt Nam (10 số).');
      return;
    }

    // Pass frontend validation, show confirm modal
    setShowConfirmModal(true);
  };

  const executeBooking = async () => {
    setIsSubmitting(true);
    try {
      // YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      
      const payload = {
        name: formData.name,
        phone: formData.phone,
        people: people,
        bookingTime: `${year}-${month}-${day}T${selectedTime}:00`,
        note: formData.note
      };

      await bookingApi.createBooking(payload);
      setIsSuccess(true);
      // Không tự ý tắt modal, chỉ đổi modal sang trạng thái Success
      toast.success('Đặt bàn thành công!');
      
      // Chờ 5s (tăng lên để khách kịp đọc) rồi tự động cho người dùng về trang chủ
      // Hoặc chờ khách tự bấm nút "Trở về"
      setTimeout(() => {
        navigate('/');
      }, 5000);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo mã đặt bàn. Vui lòng thử lại sau.');
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="customer-booking-page">
      {/* HERO SECTION */}
      <section className="booking-hero">
        <h1>Đặt Bàn Tại Saffron Harvest</h1>
        <p>Kiến tạo trải nghiệm ẩm thực tinh tế và sang trọng trong không gian đẳng cấp bậc nhất.</p>
      </section>

      <div className="booking-container">
        {/* CHI TIẾT ĐẶT BÀN */}
        <div className="booking-card">
          <div className="booking-card-header">
            <div className="icon-wrap"><Calendar size={20} /></div>
            <h2>Chi tiết đặt bàn</h2>
          </div>

          <div className="booking-row">
            {/* LỊCH */}
            <div className="booking-col">
              <span className="booking-label">Ngày đặt bàn</span>
              <div className="custom-calendar">
                <div className="calendar-header">
                  <div className="month-year">
                    Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                  </div>
                  <div className="calendar-nav">
                    <button onClick={prevMonth}><ChevronLeft size={16}/></button>
                    <button onClick={nextMonth}><ChevronRight size={16}/></button>
                  </div>
                </div>
                <div className="calendar-grid">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                    <div key={d} className="calendar-day-name">{d}</div>
                  ))}
                  {Array.from({ length: startOffset }).map((_, i) => (
                    <div key={`empty-${i}`}></div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const thisDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const isPast = thisDate < today;
                    const isSelected = selectedDate && selectedDate.getTime() === thisDate.getTime();
                    
                    return (
                      <div 
                        key={day} 
                        className={`calendar-date ${isPast ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleDateClick(day)}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SỐ KHÁCH */}
            <div className="booking-col">
              <span className="booking-label">Số lượng khách</span>
              <div className="guests-selector">
                <button onClick={decreasePeople}>&minus;</button>
                <div className="guests-count">{people}</div>
                <button onClick={increasePeople}>+</button>
              </div>

              <div className="booking-notice">
                <Info size={16} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p>Vui lòng đặt trước ít nhất 2 giờ để chúng tôi có thể phục vụ quý khách tốt nhất.</p>
              </div>
            </div>
          </div>

          {/* GIỜ NHẬN BÀN */}
          <div className="time-section">
            <span className="booking-label">Giờ nhận bàn</span>
            <div className="time-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <div className="time-grid">
                {availableTimes.map(t => {
                  const isSelected = selectedTime === t.time;
                  return (
                    <div 
                      key={t.id} 
                      className={`time-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleTimeClick(t.time)}
                    >
                      <span className="time-period">{t.period}</span>
                      <span className="time-value">{t.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG TIN LIÊN HỆ */}
        <div className="booking-card">
          <div className="booking-card-header">
            <div className="icon-wrap"><User size={20} /></div>
            <h2>Thông tin liên hệ</h2>
          </div>
          
          <div className="contact-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="form-group">
                <label>Họ và tên</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#9ca3af" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Nhập họ và tên khách hàng" 
                    style={{ paddingLeft: '44px' }}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="#9ca3af" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="tel" 
                    placeholder="Nhập số điện thoại" 
                    style={{ paddingLeft: '44px' }}
                    value={formData.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({...formData, phone: val});
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} color="#9ca3af" style={{ position: 'absolute', left: 16, top: '16px' }} />
                <textarea 
                  placeholder="Yêu cầu đặc biệt (ví dụ: kỷ niệm ngày cưới, dị ứng thực phẩm...)" 
                  style={{ paddingLeft: '44px' }}
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* TÓM TẮT ĐẶT BÀN */}
        <div className="booking-summary-card">
          <div className="summary-header">
            <div className="icon-wrap"><CheckCircle size={20} /></div>
            <h2>Tóm tắt đặt bàn</h2>
          </div>
          
          <div className="summary-details">
            <div className="summary-col">
              <div className="label">Ngày & Giờ</div>
              <div className="value">{formatSummaryDate()}</div>
            </div>
            <div className="summary-col">
              <div className="label">Số lượng khách</div>
              <div className="value">{people.toString().padStart(2, '0')} Người lớn</div>
            </div>
            <div className="summary-col">
              <div className="label">Loại đặt bàn</div>
              <div className="value">Bàn tiêu chuẩn</div>
            </div>
          </div>

          <div className="summary-footer">
            <p>Bằng việc nhấn xác nhận, bạn đồng ý với các Điều khoản & Chính sách của Saffron Harvest.</p>
            <button 
              className="btn-confirm-booking" 
              onClick={handleBooking}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt bàn'}
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION / SUCCESS MODAL */}
      {(showConfirmModal || isSuccess) && (
        <div className="booking-confirm-modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="booking-confirm-modal" style={{
            background: 'white', padding: '30px', borderRadius: '16px',
            width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}>
            {isSuccess ? (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <CheckCircle size={64} color="#10b981" strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 20px' }} />
                <h2 style={{ margin: '0 0 15px', color: '#1f2937', fontSize: '24px' }}>Đặt Bàn Thành Công!</h2>
                <p style={{ margin: '0 0 30px', color: '#4b5563', fontSize: '15px', lineHeight: '1.6' }}>
                  Chúng tôi đã nhận thông tin đặt bàn của bạn.<br />
                  Nhà hàng sẽ liên hệ với SĐT <strong>{formData.phone}</strong> để xác nhận đặt bàn trong thời gian sớm nhất.
                </p>
                <button 
                  onClick={() => navigate('/')}
                  style={{
                    width: '100%', padding: '14px 0', border: 'none',
                    background: '#10b981', color: 'white', borderRadius: '8px',
                    fontWeight: '600', fontSize: '16px', cursor: 'pointer', outline: 'none',
                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  Tuyệt vời, quay lại Trang Chủ
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ margin: '0 0 20px', color: '#1f2937', textAlign: 'center', fontSize: '22px' }}>Kiểm tra thông tin</h2>
                
                <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '25px', fontSize: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Người đặt:</span>
                    <strong style={{ color: '#1f2937' }}>{formData.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Số điện thoại:</span>
                    <strong style={{ color: '#1f2937' }}>{formData.phone}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Ngày & Giờ:</span>
                    <strong style={{ color: '#1f2937' }}>{formatSummaryDate()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Số lượng:</span>
                    <strong style={{ color: '#1f2937' }}>{people} Người lớn</strong>
                  </div>
                  {formData.note && (
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                      <span style={{ color: '#6b7280', marginBottom: '4px' }}>Ghi chú:</span>
                      <span style={{ color: '#4b5563', fontStyle: 'italic' }}>{formData.note}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <button 
                    onClick={() => setShowConfirmModal(false)}
                    disabled={isSubmitting}
                    style={{
                      flex: 1, padding: '12px 0', border: '1px solid #d1d5db',
                      background: 'white', color: '#4b5563', borderRadius: '8px',
                      fontWeight: '600', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    Chỉnh sửa lại
                  </button>
                  <button 
                    onClick={executeBooking}
                    disabled={isSubmitting}
                    style={{
                      flex: 1, padding: '12px 0', border: 'none',
                      background: '#d97706', color: 'white', borderRadius: '8px',
                      fontWeight: '600', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    {isSubmitting ? 'Đang gửi...' : 'Xác nhận Đặt Bàn'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookingPage;
