import { create } from 'zustand';
import * as api from '../api/dispute.api';

const useDisputeStore = create((set, get) => ({
  disputes: [],
  currentDispute: null,
  messages: [],
  isLoading: false,
  error: null,

  fetchDisputes: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getDisputes();
      set({ disputes: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchDisputeDetails: async (disputeId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getDisputeDetails(disputeId);
      set({ currentDispute: res.data.dispute, messages: res.data.messages, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  openDispute: async (orderId, issueType, description) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.openDispute(orderId, issueType, description);
      set({ isLoading: false });
      return res;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  },

  sendMessage: async (disputeId, message) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.addDisputeMessage(disputeId, message);
      const { messages } = get();
      set({ messages: [...messages, res.data], isLoading: false });
      return res;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      throw err;
    }
  }
}));

export default useDisputeStore;
