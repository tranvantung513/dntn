import axios from 'axios';

const API_BASE  = '/api/categories';          // Public endpoint (không cần JWT)
const API_ADMIN = '/api/v1/admin/categories'; // Admin endpoint (cần JWT + quyền)

export const categoryApi = {
  // ========= PUBLIC (khách hàng xem) =========
  getTree:      () => axios.get(`${API_BASE}/tree`),
  getWithCount: () => axios.get(`${API_BASE}/with-count`),
  getById:      (id) => axios.get(`${API_BASE}/${id}`),

  // ========= ADMIN (cần JWT) =========
  getStats:     () => axios.get(`${API_ADMIN}/stats`),
  getAll:       (keyword = '') => axios.get(`${API_ADMIN}?keyword=${keyword}`),
  create:       (data) => axios.post(API_ADMIN, data),
  update:       (id, data) => axios.put(`${API_ADMIN}/${id}`, data),
  delete:       (id) => axios.delete(`${API_ADMIN}/${id}`),
  toggleActive: (id) => axios.patch(`${API_ADMIN}/${id}/toggle-active`)
};
