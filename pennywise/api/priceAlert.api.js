import apiClient from './client';

export const getAlerts = async () => {
  const response = await apiClient.get('/price-alerts');
  return response;
};

export const createAlert = async (productId, targetPrice) => {
  const response = await apiClient.post('/price-alerts', { productId, targetPrice });
  return response;
};

export const deleteAlert = async (id) => {
  const response = await apiClient.delete(`/price-alerts/${id}`);
  return response;
};
