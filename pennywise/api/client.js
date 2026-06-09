/**
 * PennyWise API Client
 * Axios instance with JWT interceptors for automatic token management.
 *
 * - Attaches access token to every request
 * - Auto-refreshes expired tokens on 401 responses
 * - Queues pending requests during refresh to prevent race conditions
 * - Forces logout when refresh token is invalid
 */

// Using fetch-based approach since we're in Expo/React Native environment
// This avoids needing to install axios separately

import useAuthStore from '../store/authStore';

const API_BASE_URL = 'http://172.20.10.3:5000/api'; // Changed from 192.168.100.50 to current IP

let accessToken = null;
let refreshToken = null;
let isRefreshing = false;
let pendingRequests = [];

// ── Token management (in-memory, synced with secure store via authStore) ──
export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

// ── Logout callback (set by authStore) ──
let onForceLogout = null;
export const setLogoutCallback = (callback) => {
  onForceLogout = callback;
};

/**
 * Core API request function with auto-refresh.
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    ...options.headers,
  };

  let finalBody = options.body;

  if (options.body && options.body instanceof FormData) {
    // Remove Content-Type so fetch can auto-generate the multipart boundary
    delete headers['Content-Type'];
  } else if (options.body) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    finalBody = JSON.stringify(options.body);
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Fallback to authStore to survive Expo Fast Refresh state wipes
  let activeAccessToken = accessToken;
  let activeRefreshToken = refreshToken;
  try {
    const store = useAuthStore.getState();
    if (!activeAccessToken && store.accessToken) activeAccessToken = store.accessToken;
    if (!activeRefreshToken && store.refreshToken) activeRefreshToken = store.refreshToken;
  } catch (e) {}

  // Attach access token if available
  if (activeAccessToken) {
    headers['Authorization'] = `Bearer ${activeAccessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body: finalBody,
    });

    const data = await response.json();

    // If 401 and we have a refresh token, try to refresh
    if (response.status === 401 && activeRefreshToken && !options._isRetry) {
      return handleTokenRefresh(endpoint, options, activeRefreshToken);
    }

    if (!response.ok) {
      const error = new Error(data.message || 'Request failed');
      error.statusCode = response.status;
      error.errors = data.errors;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If it's a network error (not an HTTP error)
    if (!error.statusCode) {
      error.message = 'Network error. Please check your connection.';
      error.statusCode = 0;
    }
    throw error;
  }
};

/**
 * Handle token refresh with request queuing.
 */
const handleTokenRefresh = async (originalEndpoint, originalOptions, activeRefreshToken) => {
  if (isRefreshing) {
    // Queue this request until refresh completes
    return new Promise((resolve, reject) => {
      pendingRequests.push({ resolve, reject, endpoint: originalEndpoint, options: originalOptions });
    });
  }

  isRefreshing = true;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: activeRefreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    // Update tokens
    accessToken = data.data.accessToken;
    refreshToken = data.data.refreshToken;

    // Notify authStore to persist new tokens
    if (global.__authStoreRefreshCallback) {
      global.__authStoreRefreshCallback(accessToken, refreshToken);
    }

    // Retry all pending requests
    pendingRequests.forEach(({ resolve, reject, endpoint, options }) => {
      apiRequest(endpoint, { ...options, _isRetry: true })
        .then(resolve)
        .catch(reject);
    });
    pendingRequests = [];

    // Retry original request
    return apiRequest(originalEndpoint, { ...originalOptions, _isRetry: true });
  } catch (error) {
    // Refresh failed — force logout
    pendingRequests.forEach(({ reject }) => reject(error));
    pendingRequests = [];

    if (onForceLogout) {
      onForceLogout();
    }

    throw error;
  } finally {
    isRefreshing = false;
  }
};

// ── HTTP method helpers ──
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { method: 'GET', ...options }),

  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { method: 'POST', body, ...options }),

  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { method: 'PUT', body, ...options }),

  patch: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { method: 'PATCH', body, ...options }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { method: 'DELETE', ...options }),
};

export default api;
