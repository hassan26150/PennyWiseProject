import { create } from 'zustand';
import * as api from '../api/review.api';

const useReviewStore = create((set) => ({
  productReviews: [],
  sellerReviews: [],
  isLoading: false,
  error: null,
  pagination: null,

  fetchProductReviews: async (productId, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getProductReviews(productId, page);
      set({ productReviews: res.data, pagination: res.pagination, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchSellerReviews: async (sellerId, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getSellerReviews(sellerId, page);
      set({ sellerReviews: res.data, pagination: res.pagination, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  submitReview: async (orderId, productId, rating, comment) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.submitReview(orderId, productId, rating, comment);
      set({ isLoading: false });
      return res;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  }
}));

export default useReviewStore;
