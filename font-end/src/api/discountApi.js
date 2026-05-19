  import axios from 'axios';

const API_BASE = '/api/v1/admin/discounts';

export const discountApi = {
  getAll: () => axios.get(API_BASE),
  create: (data) => axios.post(API_BASE, data),
  update: (id, data) => axios.put(`${API_BASE}/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/${id}`),
  getByCode: (code) => axios.get(`${API_BASE}/code`, { params: { code } }),
  applyDiscount: (code, total) => axios.get(`${API_BASE}/apply`, { params: { code, total } })
};
