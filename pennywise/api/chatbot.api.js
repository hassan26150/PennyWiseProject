import apiClient from './client';

export const queryChatbot = async (message: string, sessionId?: string) => {
  const response = await apiClient.post('/chatbot/query', { message, session_id: sessionId });
  return response;
};

export const clearSession = async (sessionId: string) => {
  const response = await apiClient.delete(`/chatbot/session/${sessionId}`);
  return response;
};
