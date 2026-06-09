import apiClient from './client';

export const getPendingProducts = async () => {
  const response = await apiClient.get('/admin/products/pending');
  return response;
};

export const approveProduct = async (id: string) => {
  const response = await apiClient.patch(`/admin/products/${id}/approve`);
  return response;
};

export const rejectProduct = async (id: string, reason: string) => {
  const response = await apiClient.patch(`/admin/products/${id}/reject`, { reason });
  return response;
};

// ── USER MANAGEMENT ──
export const getUsers = async (params: any = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await apiClient.get(`/admin/users?${query}`);
  return response;
};

export const updateUserStatus = async (id: string, status: string, reason: string) => {
  const response = await apiClient.patch(`/admin/users/${id}/status`, { status, reason });
  return response;
};

// ── SELLER MANAGEMENT ──
export const getPendingSellers = async () => {
  const response = await apiClient.get('/admin/sellers/pending');
  return response;
};

export const approveSeller = async (id: string, reason: string = 'Approved') => {
  const response = await apiClient.patch(`/admin/sellers/${id}/approve`, { reason });
  return response;
};

export const rejectSeller = async (id: string, reason: string) => {
  const response = await apiClient.patch(`/admin/sellers/${id}/reject`, { reason });
  return response;
};

// ── DISPUTE MANAGEMENT ──
export const getDisputes = async () => {
  const response = await apiClient.get('/admin/disputes');
  return response;
};

export const resolveDispute = async (id: string, resolution: string, admin_notes: string) => {
  const response = await apiClient.patch(`/admin/disputes/${id}/resolve`, { resolution, admin_notes });
  return response;
};

// ── SYSTEM MONITORING ──
export const getScraperStatus = async () => {
  const response = await apiClient.get('/admin/scrapers/status');
  return response;
};

export const broadcastNotification = async (title: string, message: string) => {
  const response = await apiClient.post('/admin/notifications/broadcast', { title, message });
  return response;
};
