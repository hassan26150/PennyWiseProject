import apiClient from './client';

export const getFavorites = async () => {
  const response = await apiClient.get('/favorites');
  return response;
};

export const addToFavorites = async (productId) => {
  const response = await apiClient.post(`/favorites/${productId}`);
  return response;
};

export const removeFromFavorites = async (productId) => {
  const response = await apiClient.delete(`/favorites/${productId}`);
  return response;
};

export const isFavorited = async (productId) => {
  const response = await apiClient.get(`/favorites/${productId}/status`);
  return response;
};
