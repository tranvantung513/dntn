import axios from 'axios';

const API_BASE = '/api/v1/admin/settings';

export const settingsApi = {
  getAllAsMap: () => axios.get(`${API_BASE}/map`),
  updateMultiple: (data) => axios.put(API_BASE, data),
  uploadLogo: (formData) => axios.post(`${API_BASE}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};
