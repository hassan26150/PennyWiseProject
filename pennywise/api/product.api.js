import api from './client';

/**
 * Product API functions
 */

// --- Buyer / Public ---
export const fetchProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/products?${query}`);
  return response;
};

export const searchProducts = async (query, page = 1) => {
  const response = await api.get(`/products/search?q=${query}&page=${page}`);
  return response;
};

export const fetchProductDetails = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response;
};

// --- Seller ---
export const fetchMyProducts = async () => {
  const response = await api.get('/products/seller/mine');
  return response;
};

// Create product requires FormData for multipart/form-data
export const createProduct = async (formData) => {
  const response = await api.post('/products', formData);
  return response;
};

export const updateProduct = async (id, formData) => {
  const response = await api.put(`/products/${id}`, formData);
  return response;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response;
};

// --- Admin ---
export const fetchPendingProducts = async () => {
  const response = await api.get('/admin/products/pending');
  return response;
};

export const approveProduct = async (id) => {
  const response = await api.patch(`/admin/products/${id}/approve`);
  return response;
};

export const rejectProduct = async (id, reason) => {
  const response = await api.patch(`/admin/products/${id}/reject`, { reason });
  return response;
};
