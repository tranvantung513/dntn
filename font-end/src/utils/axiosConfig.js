import axios from 'axios';

// ──────────────────────────────────────────────────────────────────
// Cài đặt chung
// ──────────────────────────────────────────────────────────────────
axios.defaults.withCredentials = true; // Luôn gửi cookie (refreshToken httpOnly)

// ──────────────────────────────────────────────────────────────────
// Queue xử lý nhiều request 401 cùng lúc tránh gọi refresh nhiều lần
// ──────────────────────────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (newToken) => {
  pendingQueue.forEach(({ resolve }) => resolve(newToken));
  pendingQueue = [];
};

const rejectQueue = (err) => {
  pendingQueue.forEach(({ reject }) => reject(err));
  pendingQueue = [];
};

// ──────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR — đính token + sessionId vào mọi request
// ──────────────────────────────────────────────────────────────────
axios.interceptors.request.use(
  (config) => {
    // Gắn Access Token (nếu đã đăng nhập)
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Gửi kèm Cart Session ID (dùng cho giỏ hàng guest/login)
    const cartSession = localStorage.getItem('cartSessionId') || localStorage.getItem('guestSessionId');
    if (cartSession) {
      config.headers['X-Session-Id'] = cartSession;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — tự động refresh token khi nhận 401
// ──────────────────────────────────────────────────────────────────
axios.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    // Bỏ qua vòng lặp cho chính các endpoint auth
    const isAuthEndpoint = url.includes('/auth/refresh') || url.includes('/auth/login');

    // ── 401: Token hết hạn → thử refresh ─────────────────────────
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      // Nếu đang refresh, đưa request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh — BE dùng cookie httpOnly refreshToken
        const res = await axios.post('/auth/refresh', {}, {
          withCredentials: true,
          _retry: true // tránh interceptor này bắt lại
        });

        const newToken = res.data?.accessToken || res.data?.data?.accessToken;

        if (!newToken) throw new Error('Không nhận được token mới từ /auth/refresh');

        // Lưu token mới
        sessionStorage.setItem('accessToken', newToken);

        // Cập nhật header chung
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Giải phóng hàng đợi với token mới
        resolveQueue(newToken);

        // Retry request gốc
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);

      } catch (refreshErr) {
        rejectQueue(refreshErr);

        // Xóa toàn bộ session
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('userFullName');
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userPermissions');

        // Thông báo để App hiện modal yêu cầu đăng nhập lại
        if (!window.location.pathname.includes('/login')) {
          window.dispatchEvent(new CustomEvent('session-expired'));
        }

        return Promise.reject(refreshErr);

      } finally {
        isRefreshing = false;
      }
    }

    // ── 403: Không có quyền ───────────────────────────────────────
    if (status === 403) {
      console.warn('403 Access Denied:', url);
      // Không redirect mạnh — để component tự xử lý
    }

    return Promise.reject(error);
  }
);

export default axios;
