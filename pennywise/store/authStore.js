/**
 * PennyWise Auth Store (Zustand)
 *
 * Central state management for authentication.
 * Persists tokens via a storage adapter (AsyncStorage/SecureStore).
 */
import { create } from 'zustand';
import authApi from '../api/auth.api';
import { setTokens, clearTokens, setLogoutCallback } from '../api/client';

// ── Storage adapter ──
// Uses expo-secure-store for secure native storage (fixes AsyncStorage native module errors in Expo Go)
let storage = null;
try {
  const SecureStore = require('expo-secure-store');
  storage = {
    getItem: async (key) => await SecureStore.getItemAsync(key),
    setItem: async (key, value) => await SecureStore.setItemAsync(key, value),
    removeItem: async (key) => await SecureStore.deleteItemAsync(key),
  };
} catch (e) {
  // Fallback: in-memory storage for web
  const memoryStore = {};
  storage = {
    getItem: async (key) => memoryStore[key] || null,
    setItem: async (key, value) => { memoryStore[key] = value; },
    removeItem: async (key) => { delete memoryStore[key]; },
  };
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pennywise_access_token',
  REFRESH_TOKEN: 'pennywise_refresh_token',
  USER: 'pennywise_user',
};

const useAuthStore = create((set, get) => ({
  // ── State ──
  user: null,
  accessToken: null,
  refreshToken: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,      // true during session restore
  error: null,

  // ── Actions ──

  /**
   * Login: call API, store tokens, set state.
   */
  login: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password, role });
      const { accessToken, refreshToken, user } = response.data;

      // Set tokens in API client
      setTokens(accessToken, refreshToken);

      // Persist to storage
      await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error) {
      const message = error.data?.message || error.message || 'Login failed';
      const errors = error.data?.errors || error.errors || [];
      set({ isLoading: false, error: message });
      return { success: false, message, errors };
    }
  },

  /**
   * Signup: call API, then auto-login.
   */
  signup: async (name, email, password, role, storeName = null) => {
    set({ isLoading: true, error: null });
    try {
      const signupData = { name, email, password, role };
      if (storeName) signupData.storeName = storeName;

      await authApi.signup(signupData);

      // Auto-login after successful signup
      const loginResult = await get().login(email, password, role);
      return loginResult;
    } catch (error) {
      const message = error.data?.message || error.message || 'Signup failed';
      const errors = error.data?.errors || error.errors || [];
      set({ isLoading: false, error: message });
      return { success: false, message, errors };
    }
  },

  /**
   * Update User: call API, update local state
   */
  updateUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.updateProfile(data);
      const updatedUser = response.data.user;
      
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      set((state) => ({
        user: updatedUser,
        isLoading: false,
        error: null
      }));
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.data?.message || error.message || 'Update failed';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  /**
   * Logout: call API, clear tokens, reset state.
   */
  logout: async () => {
    try {
      const { refreshToken } = get();
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {}); // Don't block on API failure
      }
    } catch (e) {
      // Silently ignore logout API errors
    }

    // Clear everything
    clearTokens();
    await storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await storage.removeItem(STORAGE_KEYS.USER);

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Restore session from storage on app start.
   */
  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const storedAccessToken = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedRefreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const storedUser = await storage.getItem(STORAGE_KEYS.USER);

      if (!storedRefreshToken || !storedUser) {
        set({ isLoading: false });
        return;
      }

      // Set tokens in API client
      setTokens(storedAccessToken, storedRefreshToken);

      // Try to get fresh profile from API
      try {
        const response = await authApi.getProfile();
        const user = response.data.user;

        // Update stored user
        await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        set({
          user,
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          role: user.role,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (apiError) {
        // If API fails (maybe access token expired), try with stored data
        // The API client interceptor will auto-refresh the token
        if (storedUser) {
          const user = JSON.parse(storedUser);
          set({
            user,
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
            role: user.role,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // No stored data and API failed — clear session
          await get().logout();
        }
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  /**
   * Update tokens (called by API client after refresh).
   */
  setTokens: async (newAccessToken, newRefreshToken) => {
    setTokens(newAccessToken, newRefreshToken);
    await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
    await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
    set({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  },

  /**
   * Clear error state.
   */
  clearError: () => set({ error: null }),

  /**
   * Set error state.
   */
  setError: (error) => set({ error }),
}));

// ── Wire up API client callbacks ──
// Auto-refresh callback
global.__authStoreRefreshCallback = async (newAccess, newRefresh) => {
  const store = useAuthStore.getState();
  await store.setTokens(newAccess, newRefresh);
};

// Force logout callback
setLogoutCallback(() => {
  const store = useAuthStore.getState();
  store.logout();
});

export default useAuthStore;
