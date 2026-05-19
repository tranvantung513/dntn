import axios from 'axios';

const API_BASE = '/api/v1/cart';

// ====== SESSION ID MANAGEMENT ======
const SESSION_KEY = 'cartSessionId';

const getSessionId = () => localStorage.getItem(SESSION_KEY) || '';

const saveSessionId = (id) => {
  if (id) localStorage.setItem(SESSION_KEY, id);
};

// Helper: gọi API cart kèm X-Session-Id và lưu lại sessionId từ response
const cartRequest = async (method, url, data = null, params = null) => {
  const config = {
    method,
    url,
    headers: { 'X-Session-Id': getSessionId() },
    ...(data && { data }),
    ...(params && { params }),
  };
  const res = await axios(config);
  // Lưu lại sessionId mà BE trả về (để dùng cho các request sau)
  const returnedSession = res.headers['x-session-id'];
  saveSessionId(returnedSession);
  return res;
};

export const cartApi = {
  getCart: () => cartRequest('GET', API_BASE),
  addItem: (data) => cartRequest('POST', `${API_BASE}/items`, data),
  updateItemQuantity: (productId, data) =>
    cartRequest('PUT', `${API_BASE}/items/${productId}`, null, { quantity: data.quantity }),
  removeItem: (productId) => cartRequest('DELETE', `${API_BASE}/items/${productId}`),
  clearCart: () => cartRequest('DELETE', API_BASE),
};
