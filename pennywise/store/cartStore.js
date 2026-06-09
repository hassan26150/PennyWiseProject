import { create } from 'zustand';
import * as api from '../api/cart.api';

const useCartStore = create((set, get) => ({
  cartItems: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getCart();
      set({ cartItems: res.data?.items || [], isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch cart', isLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.addToCart(productId, quantity);
      set({ cartItems: res.data?.items || [], isLoading: false });
      return res;
    } catch (error) {
      set({ error: error.message || 'Failed to add item to cart', isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const res = await api.updateCartItem(itemId, quantity);
      set({ cartItems: res.data?.items || [] });
    } catch (error) {
      set({ error: error.message || 'Failed to update quantity' });
      throw error;
    }
  },

  removeItem: async (itemId) => {
    try {
      const res = await api.removeCartItem(itemId);
      set({ cartItems: res.data?.items || [] });
    } catch (error) {
      set({ error: error.message || 'Failed to remove item' });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.clearCart();
      set({ cartItems: [], isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to clear cart', isLoading: false });
      throw error;
    }
  },
}));

export default useCartStore;
