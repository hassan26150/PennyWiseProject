import apiClient from './client';

export const submitReview = async (orderId: string, productId: string, rating: number, comment: string) => {
  const response = await apiClient.post('/reviews', { orderId, productId, rating, comment });
  return response;
};

export const getProductReviews = async (productId: string, page = 1) => {
  const response = await apiClient.get(`/reviews/products/${productId}?page=${page}`);
  return response;
};

export const getSellerReviews = async (sellerId: string, page = 1) => {
  const response = await apiClient.get(`/reviews/sellers/${sellerId}?page=${page}`);
  return response;
};
