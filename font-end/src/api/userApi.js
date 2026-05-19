import axios from 'axios';

const BASE_URL = '/api/v1/admin/users';

export const userApi = {
  getAll: async (params = {}) => {
    return axios.get(BASE_URL, { params: { ...params, _t: new Date().getTime() } }); // Chống trình duyệt tự động lựu cache cũ
  },

  getById: async (id) => {
    return axios.get(`${BASE_URL}/${id}`);
  },

  create: async (data) => {
    return axios.post(BASE_URL, data);
  },

  update: async (id, data) => {
    return axios.put(`${BASE_URL}/${id}`, data);
  },

  updateRole: async (id, roles) => {
    return axios.put(`${BASE_URL}/${id}/roles`, roles);
  },

  delete: async (id) => {
    // Note: User prompt said DELETE http://103.82.24.142:9090/api/v1/admin/users
    // Usually it passes id in query or path, we will use path /id based on standard conventions
    // If it only accepts query param ?id= then adjust later, but path var is most common.
    return axios.delete(`${BASE_URL}/${id}`);
  },

  updateStatus: async (id, status) => {
    // Takes object like { status: 'LOCKED' } or just param? Assuming body or query
    return axios.patch(`${BASE_URL}/${id}/status`, { status });
  },

  getStatistics: async () => {
    return axios.get(`${BASE_URL}/statistics`);
  }
};
