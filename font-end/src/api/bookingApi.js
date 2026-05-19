import axios from 'axios';

export const bookingApi = {
  // Lấy danh sách (có hỗ trợ filter qua query param ?status=...)
  getAllBookings: async (status = null) => {
    let url = '/api/bookings';
    if (status) {
      url += `?status=${status}`;
    }
    const response = await axios.get(url);
    return response.data;
  },

  // Tạo đặt bàn mới
  createBooking: async (payload) => {
    const response = await axios.post('/api/bookings', payload);
    return response.data;
  },

  // Xác nhận
  confirmBooking: async (id) => {
    const response = await axios.put(`/api/bookings/${id}/confirm`);
    return response.data;
  },

  // Huỷ đặt bàn
  cancelBooking: async (id) => {
    const response = await axios.put(`/api/bookings/${id}/cancel`);
    return response.data;
  }
};
