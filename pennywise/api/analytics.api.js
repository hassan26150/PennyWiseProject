import apiClient from './client';

// Existing Product Analytics tracking
export const trackView = async (productId: string) => {
  return await apiClient.post('/analytics/view', { productId });
};

export const trackSearch = async (query: string, filters: any = {}) => {
  return await apiClient.post('/analytics/search', { query, filters });
};

export const trackExternalClick = async (productId: string, platform: string, url: string) => {
  return await apiClient.post('/analytics/external-click', { productId, platform, url });
};

// ── SELLER ANALYTICS ──
export const getSellerOverview = async () => {
  const response = await apiClient.get('/seller/analytics/overview');
  return response;
};

export const getSellerRevenue = async (period = 'daily') => {
  const response = await apiClient.get(`/seller/analytics/revenue?period=${period}`);
  return response;
};

export const getSellerTopProducts = async () => {
  const response = await apiClient.get('/seller/analytics/top-products');
  return response;
};

export const getSellerDiscovery = async () => {
  const response = await apiClient.get('/seller/analytics/discovery');
  return response;
};

export const getSellerTrust = async () => {
  const response = await apiClient.get('/seller/analytics/trust');
  return response;
};

// ── ADMIN ANALYTICS ──
export const getAdminOverview = async () => {
  const response = await apiClient.get('/admin/analytics/overview');
  return response;
};

export const getAdminUserActivity = async (days = 7) => {
  const response = await apiClient.get(`/admin/analytics/user-activity?days=${days}`);
  return response;
};

export const getAdminPlatformGrowth = async () => {
  const response = await apiClient.get('/admin/analytics/platform-growth');
  return response;
};

export const generateAdminReport = async (type: string, format: string) => {
  const response = await apiClient.get(`/admin/analytics/reports/generate?type=${type}&format=${format}`);
  return response;
};

export const getAdminProductDiscovery = async () => {
  const response = await apiClient.get('/admin/analytics/product-discovery');
  return response;
};

export const getAdminAIAnalytics = async () => {
  const response = await apiClient.get('/admin/analytics/ai-analytics');
  return response;
};
