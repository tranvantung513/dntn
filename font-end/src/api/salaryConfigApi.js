import axios from '../utils/axiosConfig';

export const salaryConfigApi = {
  getAll: async () => {
    return await axios.get('/api/salary-config');
  },

  getById: async (id) => {
    return await axios.get(`/api/salary-config/${id}`);
  },

  create: async (data) => {
    return await axios.post('/api/salary-config', data);
  },

  update: async (id, data) => {
    return await axios.put(`/api/salary-config/${id}`, data);
  },

  delete: async (id) => {
    return await axios.delete(`/api/salary-config/${id}`);
  }
};
