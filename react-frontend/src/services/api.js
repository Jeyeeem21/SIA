import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventories'),
  getById: (id) => api.get(`/inventories/${id}`),
  create: (data) => api.post('/inventories', data),
  update: (id, data) => api.put(`/inventories/${id}`, data),
  delete: (id) => api.delete(`/inventories/${id}`),
  restock: (id, quantity) => api.post(`/inventories/${id}/restock`, { quantity }),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  complete: (id, paymentData) => api.post(`/orders/${id}/complete`, paymentData),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

// Reports API
export const reportsAPI = {
  getReports: (params) => api.get('/reports', { params }),
  export: (type) => api.post('/reports/export', { type }),
};

// Settings API
export const settingsAPI = {
  // Profile
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data) => api.put('/settings/profile', data),
  updatePassword: (data) => api.put('/settings/password', data),
  
  // Account Management
  getUsers: () => api.get('/settings/users'),
  createUser: (data) => api.post('/settings/users', data),
  updateUser: (id, data) => api.put(`/settings/users/${id}`, data),
  deleteUser: (id) => api.delete(`/settings/users/${id}`),
  resetPassword: (id, data) => api.post(`/settings/users/${id}/reset-password`, data),
  checkEmail: (email, userId = null) => api.post('/settings/check-email', { email, user_id: userId }),
};

// Staff API
export const staffAPI = {
  getAll: () => api.get('/staff'),
  getOne: (id) => api.get(`/staff/${id}`),
  saveStaffInfo: (data) => api.post('/staff/info', data),
  createStaffAccount: (staffInfoId, data) => api.post(`/staff/${staffInfoId}/create-account`, data),
  updateStaffInfo: (id, data) => api.put(`/staff/info/${id}`, data),
  deleteStaff: (id) => api.delete(`/staff/${id}`),
  checkEmail: (email, staffInfoId = null) => api.post('/staff/check-email', { email, staff_info_id: staffInfoId }),
  resetPassword: (id, password) => api.post(`/settings/users/${id}/reset-password`, { new_password: password }),
};

// Rentals API
export const rentalsAPI = {
  // Properties
  getProperties: () => api.get('/rentals/properties'),
  getProperty: (id) => api.get(`/rentals/properties/${id}`),
  createProperty: (data) => api.post('/rentals/properties', data),
  updateProperty: (id, data) => api.put(`/rentals/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/rentals/properties/${id}`),
  
  // Tenants
  getTenants: () => api.get('/rentals/tenants'),
  getTenant: (id) => api.get(`/rentals/tenants/${id}`),
  createTenant: (data) => api.post('/rentals/tenants', data),
  updateTenant: (id, data) => api.put(`/rentals/tenants/${id}`, data),
  deleteTenant: (id) => api.delete(`/rentals/tenants/${id}`),
  
  // Contracts
  getContracts: () => api.get('/rentals/contracts'),
  getContract: (id) => api.get(`/rentals/contracts/${id}`),
  createContract: (data) => api.post('/rentals/contracts', data),
  updateContract: (id, data) => api.put(`/rentals/contracts/${id}`, data),
  deleteContract: (id) => api.delete(`/rentals/contracts/${id}`),
  renewContract: (id, data) => api.post(`/rentals/contracts/${id}/renew`, data),
  
  // Payments
  getPayments: () => api.get('/rentals/payments'),
  getPayment: (id) => api.get(`/rentals/payments/${id}`),
  createPayment: (data) => api.post('/rentals/payments', data),
  updatePayment: (id, data) => api.put(`/rentals/payments/${id}`, data),
  deletePayment: (id) => api.delete(`/rentals/payments/${id}`),
  
  // Maintenance
  getMaintenanceRequests: () => api.get('/rentals/maintenance'),
  getMaintenanceRequest: (id) => api.get(`/rentals/maintenance/${id}`),
  createMaintenanceRequest: (data) => api.post('/rentals/maintenance', data),
  updateMaintenanceRequest: (id, data) => api.put(`/rentals/maintenance/${id}`, data),
  deleteMaintenanceRequest: (id) => api.delete(`/rentals/maintenance/${id}`),
  
  // Statistics
  getStats: () => api.get('/rentals/stats'),
};

export default api;
