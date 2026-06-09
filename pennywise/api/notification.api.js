import apiClient from './client';

export const getNotifications = async (page = 1, limit = 20) => {
  const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
  return response;
};

export const getUnreadCount = async () => {
  const response = await apiClient.get('/notifications/unread-count');
  return response;
};

export const markAsRead = async (id) => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response;
};

export const markAllAsRead = async () => {
  const response = await apiClient.patch('/notifications/read-all');
  return response;
};

export const deleteNotification = async (id) => {
  const response = await apiClient.delete(`/notifications/${id}`);
  return response;
};

export const registerPushToken = async (token, platform) => {
  const response = await apiClient.post('/notifications/register-token', { token, platform });
  return response;
};
