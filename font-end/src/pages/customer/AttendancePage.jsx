import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceApi } from '../../api/attendanceApi';
import { useToast } from '../../contexts/ToastContext';
import './AttendancePage.css';

const AttendancePage = () => {
  const { userId } = useAuth();
  const toast = useToast();
  const [time, setTime] = useState(new Date());
  
  // States
  const [history, setHistory] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [loading, setLoading] = useState(false);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  
  // Realtime Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date/time
  const formattedTimeObject = {
    hours: String(time.getHours()).padStart(2, '0'),
    minutes: String(time.getMinutes()).padStart(2, '0'),
    seconds: String(time.getSeconds()).padStart(2, '0')
  };

  const getDayName = (dayIndex) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return days[dayIndex];
  };

  // Fetch Data
  const loadAttendanceData = async (monthStr) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const [year, month] = monthStr.split('-');
      
      // Attempt to load from API
      let historyData = [];
      let tHours = 0;
      
      try {
         const resHistory = await attendanceApi.getHistory(parseInt(month), parseInt(year));
         historyData = resHistory.data?.data || resHistory.data || [];
         
         // Nếu historyData là Object (VD: backend phân trang bọc trong content hoặc trả về Error JSON)
         if (!Array.isArray(historyData)) {
             historyData = historyData.content && Array.isArray(historyData.content) 
                           ? historyData.content 
                           : [];
         }

         const resHours = await attendanceApi.getTotalHours(parseInt(month), parseInt(year));
         tHours = resHours.data?.workingHours || resHours.data?.totalHours || resHours.data || 0;
      } catch (err) {
         console.warn("API không phản hồi hoặc lỗi. Sử dụng lịch sử mock tạm thời để demo.", err);
         if (month === String(new Date().getMonth() + 1).padStart(2, '0')) {
             historyData = [
               { id: 1, date: new Date().toISOString(), checkIn: '08:55:00', checkOut: null, workingHours: 0, status: 'WORKING' },
               { id: 2, date: new Date(Date.now() - 86400000).toISOString(), checkIn: '09:02:00', checkOut: '17:15:00', workingHours: 8.2, status: 'COMPLETED' },
               { id: 3, date: new Date(Date.now() - 172800000).toISOString(), checkIn: '08:50:00', checkOut: '16:55:00', workingHours: 8.0, status: 'COMPLETED' }
             ];
             tHours = 16.2;
         }
      }

      setHistory(historyData);
      setTotalHours(tHours);
    } catch (error) {
       toast.error("Quá trình tải dữ liệu chấm công gặp lỗi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadAttendanceData(selectedMonth);
    }
  }, [userId, selectedMonth]);

  // Determine current active state
  // Tìm TẤT CẢ record của ngày hôm nay (hỗ trợ nhiều ca 1 ngày)
  const todayStr = new Date().toISOString().split('T')[0];
  // Đảm bảo history luôn là mảng để tránh crash trang web
  const safeHistory = Array.isArray(history) ? history : [];
  const todayRecords = safeHistory.filter(h => {
     if (!h.date) return false;
     return h.date.split('T')[0] === todayStr || h.date.split(' ')[0] === todayStr;
  });
  
  // Lấy ca đang làm việc (có giờ vào nhưng chưa có giờ ra)
  const activeShift = todayRecords.find(h => h.checkIn && !h.checkOut);
  const isCheckedIn = !!activeShift;

  // Handle Check-in / Check-out
  const handleClockAction = async () => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để thực hiện chấm công!");
      return;
    }

    try {
      setClockActionLoading(true);
      if (isCheckedIn) {
        await attendanceApi.checkOut();
        toast.success("Kết thúc ca làm việc thành công!");
      } else {
        await attendanceApi.checkIn();
        toast.success("Nhận ca thành công! Chúc bạn làm việc hiệu quả.");
      }
      
      // Reload dữ liệu tháng hiện tại
      const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      if (selectedMonth === currentMonthStr) {
         loadAttendanceData(currentMonthStr);
      } else {
         setSelectedMonth(currentMonthStr); // Will auto trigger useEffect
      }

    } catch (error) {
       const msg = error.response?.data?.message || error.message || "Đã xảy ra lỗi!";
       toast.error(msg);
       
       // Fallback mock checkin if api is totally unavailable (just for UI preview based on the screenshot)
       if (!error.response && isCheckedIn !== undefined) {
          toast.success("Mock: Thao tác chấm công ghi nhận tạm ở UI");
          loadAttendanceData(selectedMonth);
       }
    } finally {
      setClockActionLoading(false);
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div className="attendance-date-subtitle">
          {getDayName(time.getDay())}, ngày {time.getDate()} tháng {time.getMonth() + 1}
        </div>
        <h1>Chấm công nhân viên</h1>
        {isCheckedIn && (
          <div className="attendance-status-badge">
            <div className="dot"></div>
            Bạn đang trong ca trực
          </div>
        )}
      </div>

      <div className="attendance-clock-card">
        <div className="clock-info">
          <div className="clock-label">THỜI GIAN HIỆN TẠI</div>
          <div className="clock-time">
            {formattedTimeObject.hours}:{formattedTimeObject.minutes}<span>{formattedTimeObject.seconds}</span>
          </div>
        </div>
        
        <div className="clock-action">
          {isCheckedIn ? (
            <button 
              className="btn-clock-out" 
              onClick={handleClockAction}
              disabled={clockActionLoading}
            >
              <LogOut size={24} /> Kết thúc ca
            </button>
          ) : (
            <button 
              className="btn-clock-in" 
              onClick={handleClockAction}
              disabled={clockActionLoading}
            >
              <LogIn size={24} /> Bắt đầu ca
            </button>
          )}
          {!isCheckedIn && todayRecords.length > 0 && (
            <div className="clock-note">Bạn đã hoàn thành {todayRecords.length} ca làm việc hôm nay</div>
          )}
          {!isCheckedIn && todayRecords.length === 0 && (
             <div className="clock-note">Vui lòng bật định vị để chấm công</div>
          )}
        </div>
        
        <Clock className="bg-clock-icon" size={180} opacity={0.5} strokeWidth={1} />
      </div>

      <div className="attendance-history-card">
        <div className="history-header">
          <h2>Lịch sử chấm công gần đây</h2>
          <div className="history-header-actions">
            <div className="history-month-selector">
              <input 
                type="month" 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
              />
            </div>
            {totalHours > 0 && (
              <div className="history-total-hours">
                Tổng giờ: {totalHours.toFixed(1)}h
              </div>
            )}
          </div>
        </div>

        <table className="history-table">
          <thead>
            <tr>
              <th>NGÀY</th>
              <th>VÀO CA</th>
              <th>TAN CA</th>
              <th>TỔNG GIỜ</th>
              <th>TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign: 'center'}}>Đang tải dữ liệu...</td></tr>
            ) : (Array.isArray(history) ? history : []).length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', color: '#94a3b8'}}>Chưa có dữ liệu chấm công cho tháng này</td></tr>
            ) : (
              (Array.isArray(history) ? history : []).map((record, idx) => {
                const dateObj = new Date(record.date);
                const formatTime = (timeStr) => {
                   if (!timeStr) return '--:--';
                   let str = typeof timeStr === 'string' ? timeStr : String(timeStr);
                   // Xử lý lỡ Backend trả về nguyên format '2026-04-19T08:55:00'
                   if (str.includes('T')) {
                       str = str.split('T')[1];
                   } else if (str.includes(' ')) {
                       str = str.split(' ')[1];
                   }
                   const parts = str.split(':');
                   if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
                   return str;
                };

                const isValidOut = !!record.checkOut;

                return (
                  <tr key={record.id || idx}>
                    <td className="col-date">{String(dateObj.getDate()).padStart(2, '0')}/{String(dateObj.getMonth() + 1).padStart(2, '0')}/{dateObj.getFullYear()}</td>
                    <td className="col-time">{formatTime(record.checkIn)}</td>
                    <td className="col-time">{formatTime(record.checkOut)}</td>
                    <td className="col-total">{(record.workingHours || record.totalHours) ? `${(record.workingHours || record.totalHours).toFixed(1)}h` : '--'}</td>
                    <td>
                      {!isValidOut ? (
                         <span className="status-badge missing">Đang làm việc</span>
                      ) : record.status === 'APPROVED' ? (
                         <span className="status-badge confirmed">Đã xác nhận</span>
                      ) : record.status === 'REJECTED' ? (
                         <span className="status-badge rejected">Từ chối</span>
                      ) : (
                         <span className="status-badge pending">Chờ xác nhận</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
