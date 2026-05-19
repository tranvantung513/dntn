import axios from 'axios';

const BASE_URL = '/api/v1/otp';

export const otpApi = {
  /**
   * Yêu cầu gửi mã OTP tới Email
   * @param {Object} payload - { email: string, type: string }
   */
  send: async (payload) => {
    const response = await axios.post(`${BASE_URL}/send`, payload);
    return response.data;
  },

  /**
   * Xác minh mã OTP
   * @param {Object} payload - { email: string, otp: string, type: string }
   */
  verify: async (payload) => {
    const response = await axios.post(`${BASE_URL}/verify`, payload);
    return response.data;
  }
};
