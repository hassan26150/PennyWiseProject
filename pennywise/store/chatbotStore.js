import { create } from 'zustand';
import * as api from '../api/chatbot.api';

const useChatbotStore = create((set, get) => ({
  messages: [{
    id: 1,
    type: 'bot',
    text: "Hi! I'm PennyWise AI Assistant. I can help you find the best prices for products across multiple sellers. Try asking me about products you're looking for!",
  }],
  sessionId: null,
  isTyping: false,
  error: null,

  sendMessage: async (text) => {
    const { sessionId, messages } = get();
    
    // Add user message immediately
    const userMsg = { id: Date.now(), type: 'user', text };
    set({ messages: [...messages, userMsg], isTyping: true, error: null });

    try {
      const res = await api.queryChatbot(text, sessionId);
      const data = res.data;

      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.response,
        products: data.products || []
      };

      set((state) => ({
        messages: [...state.messages, botMsg],
        sessionId: data.session_id, // Store returned session ID
        isTyping: false
      }));
    } catch (err) {
      set((state) => ({
        messages: [...state.messages, { id: Date.now() + 1, type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }],
        isTyping: false,
        error: err.message
      }));
    }
  },

  clearChat: async () => {
    const { sessionId } = get();
    if (sessionId) {
      try {
        await api.clearSession(sessionId);
      } catch (e) {
        console.log('Failed to clear session on backend', e);
      }
    }
    set({
      messages: [{
        id: 1,
        type: 'bot',
        text: "Hi! I'm PennyWise AI Assistant. Let's start a new conversation. What are you looking for today?",
      }],
      sessionId: null,
      error: null
    });
  }
}));

export default useChatbotStore;
