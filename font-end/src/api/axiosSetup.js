/**
 * Axios interceptor — tự động refresh access token khi nhận 401.
 *
 * Luồng:
 *  1. Request bất kỳ → BE trả 401 (token hết hạn)
 *  2. Interceptor gọi POST /auth/refresh (dùng refreshToken cookie httpOnly)
 *  3. Nhận accessToken mới → lưu sessionStorage → retry request gốc
 *  4. Nếu refresh cũng thất bại → dispatch 'session-expired' → user phải đăng nhập lại
 */
import axios from 'axios';

let isRefreshing = false;
let failedQueue = []; // Hàng đợi các request bị 401 trong khi đang refresh

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

export const setupAxiosInterceptors = () => {
  // ── REQUEST: đính token vào header ─────────────────────────────────
  axios.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem('accessToken');
      if (token && !config._skipAuth) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── RESPONSE: bắt 401 và tự refresh ────────────────────────────────
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Chỉ xử lý 401, không lặp vô hạn, không xử lý endpoint refresh chính nó
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/login')
      ) {
        // Nếu đang refresh → đưa request vào hàng đợi chờ
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Gọi refresh — BE dùng httpOnly cookie refreshToken
          const res = await axios.post('/auth/refresh', {}, { _skipAuth: true });

          const newToken =
            res.data?.accessToken ||
            res.data?.data?.accessToken ||
            res.data?.token;

          if (!newToken) throw new Error('No token in refresh response');

          // Lưu token mới
          sessionStorage.setItem('accessToken', newToken);

          // Cập nhật header mặc định cho lần sau
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

          processQueue(null, newToken);

          // Retry request gốc với token mới
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          // Refresh thất bại → xóa session và thông báo user
          sessionStorage.clear();
          window.dispatchEvent(new CustomEvent('session-expired'));

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};
