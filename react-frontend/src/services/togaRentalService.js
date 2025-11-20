import api from './api';

// ==================== DEPARTMENTS ====================

export const getDepartments = async () => {
  const response = await api.get('/toga-rentals/departments');
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post('/toga-rentals/departments', data);
  return response.data;
};

export const updateDepartment = async (id, data) => {
  const response = await api.put(`/toga-rentals/departments/${id}`, data);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/toga-rentals/departments/${id}`);
  return response.data;
};

// ==================== RENTALS/STUDENTS ====================

export const getRentals = async (departmentId) => {
  const response = await api.get(`/toga-rentals/departments/${departmentId}/rentals`);
  return response.data;
};

export const createRental = async (data) => {
  const response = await api.post('/toga-rentals/rentals', data);
  return response.data;
};

export const updateRental = async (id, data) => {
  const response = await api.put(`/toga-rentals/rentals/${id}`, data);
  return response.data;
};

export const deleteRental = async (id) => {
  const response = await api.delete(`/toga-rentals/rentals/${id}`);
  return response.data;
};

// ==================== PAYMENTS ====================

export const getPayments = async (departmentId) => {
  const response = await api.get(`/toga-rentals/departments/${departmentId}/payments`);
  return response.data;
};

export const createPayment = async (data) => {
  const response = await api.post('/toga-rentals/payments', data);
  return response.data;
};

export const updatePayment = async (id, data) => {
  const response = await api.put(`/toga-rentals/payments/${id}`, data);
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await api.delete(`/toga-rentals/payments/${id}`);
  return response.data;
};

// ==================== STATISTICS ====================

export const getStats = async () => {
  const response = await api.get('/toga-rentals/stats');
  return response.data;
};
