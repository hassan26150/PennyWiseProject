import { create } from 'zustand';
import * as api from '../api/recommendation.api';

const useRecommendationStore = create((set) => ({
  recommendations: [],
  isLoading: false,
  error: null,

  fetchRecommendations: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getRecommendations();
      // res.data is an array of RecommendationCache objects { product_id, recommendation_type, score }
      set({ recommendations: res.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch recommendations', isLoading: false });
    }
  },
}));

export default useRecommendationStore;
