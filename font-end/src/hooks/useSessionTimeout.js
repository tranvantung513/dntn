import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook theo dõi thời gian không hoạt động của user.
 * Khi hết timeout → xóa session + dispatch event 'session-expired'.
 *
 * @param {number} timeoutMs      - Thời gian không hoạt động (ms). Mặc định 30 phút.
 * @param {number} warningMs      - Cảnh báo trước khi hết hạn bao nhiêu ms. Mặc định 2 phút.
 * @param {boolean} isAuthenticated - Chỉ kích hoạt khi đã đăng nhập.
 */
const useSessionTimeout = (
  timeoutMs = 30 * 60 * 1000,   // 30 phút
  warningMs = 2 * 60 * 1000,    // cảnh báo 2 phút trước
  isAuthenticated = false
) => {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
  }, []);

  const expireSession = useCallback(() => {
    // Xóa token
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userFullName');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userPermissions');
    // Thông báo toàn app
    window.dispatchEvent(new CustomEvent('session-expired'));
  }, []);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;
    clearTimers();

    // Cảnh báo sắp hết hạn
    warningRef.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('session-warning', {
        detail: { remainingMs: warningMs }
      }));
    }, timeoutMs - warningMs);

    // Hết hạn thực sự
    timeoutRef.current = setTimeout(expireSession, timeoutMs);
  }, [isAuthenticated, timeoutMs, warningMs, clearTimers, expireSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }

    // Các sự kiện hoạt động của user
    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    EVENTS.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer(); // Bắt đầu đếm ngay

    return () => {
      clearTimers();
      EVENTS.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [isAuthenticated, resetTimer, clearTimers]);
};

export default useSessionTimeout;
