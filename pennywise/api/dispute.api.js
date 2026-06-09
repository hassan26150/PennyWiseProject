import apiClient from './client';

export const openDispute = async (orderId: string, issueType: string, description: string) => {
  const response = await apiClient.post('/disputes', { orderId, issueType, description });
  return response;
};

export const getDisputes = async () => {
  const response = await apiClient.get('/disputes');
  return response;
};

export const getDisputeDetails = async (disputeId: string) => {
  const response = await apiClient.get(`/disputes/${disputeId}`);
  return response;
};

export const addDisputeMessage = async (disputeId: string, message: string) => {
  const response = await apiClient.post(`/disputes/${disputeId}/messages`, { message });
  return response;
};

export const resolveDispute = async (disputeId: string, status: string, resolution: string) => {
  const response = await apiClient.patch(`/disputes/${disputeId}/resolve`, { status, resolution });
  return response;
};
