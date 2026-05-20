import axios from 'axios';

const API_BASE = '/api/attendances/adminattandances';

export const adminAttendanceApi = {
  create: async (data) => {
    return await axios.post('/api/attendances/admin', data);
  },
  // Lấy tất cả lịch sử chấm công theo ngày
  getAll: async (params = {}) => {
    const response = await axios.get(API_BASE, { params });
    let records = [];
    if (Array.isArray(response.data)) {
        records = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
        records = response.data.data;
    } else if (response.data && Array.isArray(response.data.content)) {
        records = response.data.content;
    }
    return records;
  },

  // Lấy toàn bộ bản ghi trong tháng/năm
  getByMonth: async (month, year) => {
    const response = await axios.get('/api/attendances/admin/monthly', { params: { month, year } });
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },

  // Lấy bản ghi của 1 nhân viên trong tháng/năm
  getByUserAndMonth: async (userId, month, year) => {
    const response = await axios.get('/api/attendances/admin/user-monthly', { params: { userId, month, year } });
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },

  updateStatus: async (id, status) => {
    return await axios.patch(`/api/attendances/${id}/status?status=${status}`);
  },

  updateTimes: async (id, checkIn, checkOut) => {
    return await axios.put(`/api/attendances/${id}`, { checkIn, checkOut });
  },

  delete: async (id) => {
    return await axios.delete(`/api/attendances/${id}`);
  }
};
