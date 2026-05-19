import axios from 'axios';

const API_BASE = '/api/attendances';

export const attendanceApi = {
  checkIn: async () => {
    return axios.post(`${API_BASE}/check-in`);
  },

  checkOut: async () => {
    return axios.post(`${API_BASE}/check-out`);
  },

  getHistory: async (month, year) => {
    return axios.get(`${API_BASE}/history`, {
      params: { month, year }
    });
  },

  getTotalHours: async (month, year) => {
    return axios.get(`${API_BASE}/total-hours`, {
      params: { month, year }
    });
  }
};
