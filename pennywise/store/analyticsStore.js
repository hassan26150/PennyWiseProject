import { create } from 'zustand';
import * as api from '../api/analytics.api';

const useAnalyticsStore = create((set, get) => ({
  sellerOverview: null,
  sellerRevenue: [],
  sellerTopProducts: [],
  sellerDiscovery: null,
  sellerTrust: null,

  adminOverview: null,
  adminUserActivity: [],
  adminPlatformGrowth: null,
  adminProductDiscovery: null,
  adminAI: null,
  
  isLoading: false,
  error: null,

  fetchSellerAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const [overview, revenue, topProducts, discovery, trust] = await Promise.all([
        api.getSellerOverview(),
        api.getSellerRevenue('monthly'),
        api.getSellerTopProducts(),
        api.getSellerDiscovery(),
        api.getSellerTrust()
      ]);
      set({
        sellerOverview: overview.data,
        sellerRevenue: revenue.data,
        sellerTopProducts: topProducts.data,
        sellerDiscovery: discovery.data,
        sellerTrust: trust.data,
        isLoading: false
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAdminAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const [overview, activity, growth, discovery, ai] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUserActivity(),
        api.getAdminPlatformGrowth(),
        api.getAdminProductDiscovery(),
        api.getAdminAIAnalytics ? api.getAdminAIAnalytics() : { data: {} } // optional AI
      ]);
      set({
        adminOverview: overview.data,
        adminUserActivity: activity.data,
        adminPlatformGrowth: growth.data,
        adminProductDiscovery: discovery.data,
        adminAI: ai.data,
        isLoading: false
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  generateReport: async (type, format) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.generateAdminReport(type, format);
      set({ isLoading: false });
      return res;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  }
}));

export default useAnalyticsStore;
