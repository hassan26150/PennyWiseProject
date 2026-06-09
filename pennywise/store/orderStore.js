import { create } from 'zustand';
import * as api from '../api/order.api';

const useOrderStore = create((set) => ({
  buyerOrders: [],
  sellerOrders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  // ── Buyer Actions ──

  checkout: async (shippingAddress, paymentMethod) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.checkout(shippingAddress, paymentMethod);
      set({ isLoading: false });
      return res;
    } catch (error) {
      set({ error: error.message || 'Checkout failed', isLoading: false });
      throw error;
    }
  },

  fetchBuyerOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getBuyerOrders();
      set({ buyerOrders: res.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch orders', isLoading: false });
    }
  },

  fetchOrderDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getOrderDetails(id);
      set({ currentOrder: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch order details', isLoading: false });
    }
  },

  cancelOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.cancelOrder(id);
      set((state) => ({
        buyerOrders: state.buyerOrders.map(o => o._id === id ? { ...o, status: 'cancelled' } : o),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to cancel order', isLoading: false });
      throw error;
    }
  },

  // ── Seller Actions ──

  fetchSellerOrders: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getSellerOrders(status);
      set({ sellerOrders: res.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch seller orders', isLoading: false });
    }
  },

  confirmOrder: async (id) => {
    try {
      await api.confirmOrder(id);
      set((state) => ({
        sellerOrders: state.sellerOrders.map(o => o._id === id ? { ...o, status: 'confirmed' } : o)
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to confirm order' });
      throw error;
    }
  },

  processOrder: async (id) => {
    try {
      await api.processOrder(id);
      set((state) => ({
        sellerOrders: state.sellerOrders.map(o => o._id === id ? { ...o, status: 'processing' } : o)
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to process order' });
      throw error;
    }
  },

  shipOrder: async (id, trackingNumber) => {
    try {
      await api.shipOrder(id, trackingNumber);
      set((state) => ({
        sellerOrders: state.sellerOrders.map(o => o._id === id ? { ...o, status: 'shipped', tracking_number: trackingNumber } : o)
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to ship order' });
      throw error;
    }
  },

  deliverOrder: async (id) => {
    try {
      await api.deliverOrder(id);
      set((state) => ({
        sellerOrders: state.sellerOrders.map(o => o._id === id ? { ...o, status: 'delivered' } : o)
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to mark order as delivered' });
      throw error;
    }
  },
  
  cancelSellerOrder: async (id) => {
    try {
      await api.cancelSellerOrder(id);
      set((state) => ({
        sellerOrders: state.sellerOrders.map(o => o._id === id ? { ...o, status: 'cancelled' } : o)
      }));
    } catch (error) {
      set({ error: error.message || 'Failed to cancel order' });
      throw error;
    }
  },

  // ── Analytics ──
  
  trackExternalClick: async (productId, platform, externalUrl) => {
    try {
      await api.trackExternalClick(productId, platform, externalUrl);
    } catch (error) {
      console.warn('Failed to track external click:', error);
    }
  }
}));

export default useOrderStore;
