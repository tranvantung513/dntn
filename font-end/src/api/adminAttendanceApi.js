import axios from 'axios';

const API_BASE = '/api/attendances/adminattandances';

export const adminAttendanceApi = {
  create: async (data) => {
    return await axios.post('/api/attendances/admin', data);
  },
  // Thực tế: Lấy tất cả lịch sử chấm công
  getAll: async (params = {}) => {
    const response = await axios.get(API_BASE, { params });
    // Hỗ trợ cả 3 định dạng trả về phổ biến: Array trực tiếp, Object bọc .data, Object bọc .content (Page)
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
