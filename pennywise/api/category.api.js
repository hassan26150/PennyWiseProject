import api from './client';

/**
 * Category API functions
 */

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response;
};

export const createCategory = async (data) => {
  const response = await api.post('/categories', data);
  return response;
};
