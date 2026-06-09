/**
 * Auth API functions — thin wrappers around the API client.
 */
import api from './client';

export const authApi = {
  signup: (data) => api.post('/auth/signup', data),

  login: (data) => api.post('/auth/login', data),

  refreshTokens: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),

  getProfile: () => api.get('/auth/me'),

  updateProfile: (data) => api.put('/auth/me', data),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export default authApi;
