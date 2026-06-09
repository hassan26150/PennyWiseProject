import { create } from 'zustand';
import * as api from '../api/product.api';
import * as comparisonApi from '../api/comparison.api';

const useProductStore = create((set, get) => ({
  // State
  publicProducts: [],
  searchResults: [],
  myProducts: [],
  pendingProducts: [],
  currentProduct: null,
  
  // Comparison state
  comparisonPrices: [],
  comparisonStats: null,
  priceHistory: null,
  isComparisonLoading: false,
  comparisonError: null,

  isLoading: false,
  error: null,
  
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },

  // Actions
  clearError: () => set({ error: null }),

  fetchPublicProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.fetchProducts(params);
      set({ 
        publicProducts: res.data || [],
        pagination: res.pagination,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch products',
        isLoading: false 
      });
    }
  },

  searchProducts: async (query, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.searchProducts(query, page);
      set({ 
        searchResults: res.data || [],
        pagination: res.pagination,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Search failed',
        isLoading: false 
      });
    }
  },

  fetchProductDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.fetchProductDetails(id);
      set({ currentProduct: res.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch product details',
        isLoading: false 
      });
    }
  },

  recordProductView: async (id) => {
    try {
      // Backend automatically increments view count on GET /products/:id
      await api.fetchProductDetails(id);
    } catch (error) {
      console.warn('Failed to record product view', error);
    }
  },

  fetchMyProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.fetchMyProducts();
      set({ myProducts: res.data || [], isLoading: false });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch your products',
        isLoading: false 
      });
    }
  },

  createProduct: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.createProduct(formData);
      // Refresh my products
      await get().fetchMyProducts();
      set({ isLoading: false });
      return res;
    } catch (error) {
      const err = error.message || 'Failed to create product';
      set({ error: err, isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id, formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.updateProduct(id, formData);
      // Refresh my products
      await get().fetchMyProducts();
      set({ isLoading: false });
      return res;
    } catch (error) {
      const err = error.message || 'Failed to update product';
      set({ error: err, isLoading: false });
      throw error;
    }
  },

  fetchPendingProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.fetchPendingProducts();
      set({ pendingProducts: res.data || [], isLoading: false });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch pending products',
        isLoading: false 
      });
    }
  },

  approveProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.approveProduct(id);
      // Remove from pending
      set((state) => ({
        pendingProducts: state.pendingProducts.filter(p => p._id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error.message || 'Failed to approve product',
        isLoading: false 
      });
    }
  },

  rejectProduct: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      await api.rejectProduct(id, reason);
      // Remove from pending
      set((state) => ({
        pendingProducts: state.pendingProducts.filter(p => p._id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error.message || 'Failed to reject product',
        isLoading: false 
      });
    }
  },

  // ── Price Comparison Actions ──

  fetchComparePrices: async (productId) => {
    set({ isComparisonLoading: true, comparisonError: null });
    try {
      const res = await comparisonApi.fetchComparePrices(productId);
      set({
        comparisonPrices: res.data?.comparisons || [],
        comparisonStats: res.data?.stats || null,
        isComparisonLoading: false,
      });
    } catch (error) {
      set({
        comparisonError: error.message || 'Failed to fetch price comparisons',
        isComparisonLoading: false,
      });
    }
  },

  fetchPriceHistory: async (productId, days = 30) => {
    try {
      const res = await comparisonApi.fetchPriceHistory(productId, days);
      set({ priceHistory: res.data || null });
    } catch (error) {
      console.warn('Failed to fetch price history', error);
    }
  },

  clearComparison: () => set({
    comparisonPrices: [],
    comparisonStats: null,
    priceHistory: null,
    comparisonError: null,
  }),
}));

export default useProductStore;

