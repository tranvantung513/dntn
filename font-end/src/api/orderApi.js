import axios from 'axios';

export const orderApi = {
  // Tạo thanh toán / Đơn hàng
  createOrder: (data) => {
    return axios.post('/api/orders', data);
  },

  // Xem danh sách đơn
  getOrders: () => {
    return axios.get('/api/orders');
  },

  // Xem chi tiết đơn
  getOrderById: (id) => {
    return axios.get(`/api/orders/${id}`);
  },

  // Xem danh sách đơn theo user
  getOrdersByUser: (userId) => {
    return axios.get(`/api/orders/user/${userId}`);
  },

  // Cập nhật đơn hàng (thông tin chung)
  updateOrder: (id, data) => {
    return axios.put(`/api/orders/${id}`, data);
  },

  // Cập nhật trạng thái đơn (PENDING, CONFIRMED, IN_PROGRESS, READY, COMPLETED, CANCELLED)
  updateOrderStatus: (id, status) => {
    if (status === 'CANCELLED') {
      return axios.patch(`/api/orders/${id}/cancel`);
    }
    return axios.patch(`/api/orders/${id}/status?status=${status}`);
  },

  // Cập nhật trạng thái thanh toán (UNPAID, PAID, FAILED, REFUNDED)
  updatePaymentStatus: (id, paymentStatus) => {
    return axios.patch(`/api/orders/${id}/payment?paymentStatus=${paymentStatus}`);
  },

  // VietQR API
  generateVietQr: (orderId) => {
    return axios.post(`/api/payment/vietqr/${orderId}`);
  },

  confirmVietQr: (orderId) => {
    return axios.post(`/api/payment/vietqr/confirm/${orderId}`);
  }
};
