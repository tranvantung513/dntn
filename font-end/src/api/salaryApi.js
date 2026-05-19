import axios from '../utils/axiosConfig';

export const salaryApi = {
  getAll: async (month, year) => {
    return await axios.get(`/api/salaries?month=${month}&year=${year}`);
  },

  update: async (userId, month, year, data) => {
    return await axios.put(`/api/salaries/${userId}?month=${month}&year=${year}`, data);
  },

  delete: async (userId, month, year) => {
    return await axios.delete(`/api/salaries/${userId}?month=${month}&year=${year}`);
  },

  lock: async (month, year) => {
    return await axios.post(`/api/salaries/lock?month=${month}&year=${year}`);
  },

  exportExcel: async (month, year) => {
    return await axios.get(`/api/salaries/export?month=${month}&year=${year}`, {
      responseType: 'blob'
    });
  }
};
