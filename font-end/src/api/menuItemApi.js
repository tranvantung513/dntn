import axios from 'axios';

const API_BASE = '/api/menu-items';         // Public endpoint (không cần JWT)
const API_ADMIN = '/api/v1/admin/menu-items'; // Admin endpoint (cần JWT + quyền)

export const menuItemApi = {
  // ========= PUBLIC (khách hàng xem) =========
  getAll: (params = {}) => {
    return axios.get(API_BASE, { params });
  },
  getById: (id) => axios.get(`${API_BASE}/${id}`),
  search: (params = {}) => axios.get(`${API_BASE}/search`, { params }),

  // ========= ADMIN (cần JWT) =========
  getDashboardStats: () => axios.get(`${API_ADMIN}/dashboard`),
  getBatchItems: (data) => axios.post(`${API_ADMIN}/batch`, data),
  create: (data) => axios.post(API_ADMIN, data),
  update: (id, data) => axios.put(`${API_ADMIN}/${id}`, data),
  delete: (id) => axios.delete(`${API_ADMIN}/${id}`),
  toggleActive: (id) => axios.patch(`${API_ADMIN}/${id}/toggle-active`),
  toggleFeature: (id) => axios.put(`${API_ADMIN}/${id}/feature`),
  uploadImages: (id, formData) => {
    return axios.post(`${API_ADMIN}/${id}/upload-images`, formData, {
      timeout: 30000,
    });
  }
};

