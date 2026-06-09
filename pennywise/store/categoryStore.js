import { create } from 'zustand';
import * as api from '../api/category.api';

const useCategoryStore = create((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.fetchCategories();
      set({ categories: res.data || [], isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch categories',
        isLoading: false 
      });
    }
  },
}));

export default useCategoryStore;
