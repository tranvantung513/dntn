import axios from 'axios';

const API_BASE = '/proxy-admin/roles';

export const roleApi = {
  getAll: () => axios.get(API_BASE),
  getById: (id) => axios.get(`${API_BASE}/${id}`),
  create: (data) => axios.post(API_BASE, data),
  update: (id, data) => axios.put(`${API_BASE}/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/${id}`),
  enable: (id) => axios.put(`${API_BASE}/${id}/enable`, {}),
  disable: (id) => axios.put(`${API_BASE}/${id}/disable`, {}),

  // Permission Matrix Endpoints
  getGroupedPermissions: () => axios.get(`/proxy-admin/permissions/grouped`),
  getPermissionMatrix: (id) => axios.get(`${API_BASE}/${id}/permission-matrix`),
  updatePermissionMatrix: (id, data) => axios.post(`${API_BASE}/${id}/permission-matrix`, data)
};
