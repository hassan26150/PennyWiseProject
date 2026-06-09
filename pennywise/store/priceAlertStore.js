import { create } from 'zustand';
import * as api from '../api/priceAlert.api';

const usePriceAlertStore = create((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,

  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getAlerts();
      set({ alerts: res.data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to fetch price alerts', isLoading: false });
    }
  },

  createAlert: async (productId, targetPrice) => {
    set({ isLoading: true, error: null });
    try {
      await api.createAlert(productId, targetPrice);
      await get().fetchAlerts(); // Refresh list to get updated item
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message || 'Failed to set price alert', isLoading: false });
      throw error;
    }
  },

  deleteAlert: async (id) => {
    // Optimistic update
    set((state) => ({
      alerts: state.alerts.filter((a) => a._id !== id)
    }));
    try {
      await api.deleteAlert(id);
    } catch (error) {
      console.error('Failed to delete alert', error);
      get().fetchAlerts();
    }
  },
}));

export default usePriceAlertStore;
