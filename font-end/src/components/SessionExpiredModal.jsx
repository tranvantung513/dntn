import React, { useEffect, useState, useCallback } from 'react';

/**
 * Modal thông báo phiên làm việc đã kết thúc.
 * Hiển thị khi nhận event 'session-expired' hoặc 'session-warning'.
 */
const SessionExpiredModal = ({ onGoToLogin }) => {
  const [show, setShow] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [countdown, setCountdown] = useState(120); // giây

  // Lắng nghe event từ useSessionTimeout hook
  useEffect(() => {
    const handleExpired = () => {
      setIsWarning(false);
      setShow(true);
    };

    const handleWarning = (e) => {
      const remainingSec = Math.floor((e.detail?.remainingMs || 120000) / 1000);
      setCountdown(remainingSec);
      setIsWarning(true);
      setShow(true);
    };

    window.addEventListener('session-expired', handleExpired);
    window.addEventListener('session-warning', handleWarning);
    return () => {
      window.removeEventListener('session-expired', handleExpired);
      window.removeEventListener('session-warning', handleWarning);
    };
  }, []);

  // Đếm ngược khi đang warning
  useEffect(() => {
    if (!show || !isWarning) return;
    if (countdown <= 0) {
      setIsWarning(false); // chuyển sang màn hình "đã hết hạn"
      return;
    }
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [show, isWarning, countdown]);

  const handleGoToLogin = useCallback(() => {
    setShow(false);
    onGoToLogin?.();
  }, [onGoToLogin]);

  const handleStayLoggedIn = useCallback(() => {
    // Chỉ có thể "ở lại" khi còn trong warning, chưa bị xóa token
    window.dispatchEvent(new Event('user-activity-reset'));
    setShow(false);
    setIsWarning(false);
  }, []);

  if (!show) return null;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999,
      animation: 'fadeInOverlay 0.2s ease'
    }}>
      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        .session-modal-card { animation: slideUp 0.25s ease; }
        .session-btn-primary:hover { filter: brightness(1.1); }
        .session-btn-secondary:hover { background: #f1f5f9 !important; }
      `}</style>

      <div className="session-modal-card" style={{
        background: 'white',
        padding: '40px 36px',
        borderRadius: '16px',
        width: '420px',
        maxWidth: '90vw',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: isWarning ? '#fef3c7' : '#fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          {isWarning ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
          {isWarning ? 'Phiên sắp kết thúc' : 'Phiên làm việc đã kết thúc'}
        </h3>

        {/* Description */}
        <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>
          {isWarning
            ? 'Bạn không hoạt động trong một thời gian. Phiên làm việc sẽ tự động kết thúc sau:'
            : 'Do không có hoạt động trong thời gian dài, phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.'}
        </p>

        {/* Countdown */}
        {isWarning && (
          <div style={{
            fontSize: 42, fontWeight: 800,
            color: countdown <= 30 ? '#ef4444' : '#d97706',
            letterSpacing: 2, margin: '0 0 24px',
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.3s'
          }}>
            {formatTime(countdown)}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isWarning && (
            <button
              className="session-btn-secondary"
              onClick={handleStayLoggedIn}
              style={{
                background: 'white', color: '#374151',
                border: '1.5px solid #e2e8f0',
                padding: '12px 24px', borderRadius: 10,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.15s'
              }}
            >
              Tôi vẫn đang ở đây
            </button>
          )}
          <button
            className="session-btn-primary"
            onClick={handleGoToLogin}
            style={{
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: 'white', border: 'none',
              padding: '13px 24px', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              transition: 'filter 0.15s',
              boxShadow: '0 4px 12px rgba(217,119,6,0.3)'
            }}
          >
            🔐 Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
