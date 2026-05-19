import axios from 'axios';

export const authApi = {
  login: async (email, password) => {
    return axios.post('/auth/login', { email, password });
  },

  refreshToken: async () => {
    return axios.post('/auth/refresh');
  },

  logout: async () => {
    return axios.post('/auth/logout');
  },

  forgotPassword: async (email, newPassword, confirmPassword) => {
    return axios.post('/auth/forgot-password', { 
      email, 
      newPassword,
      confirmPassword 
    });
  }
};
