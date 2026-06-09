import { create } from 'zustand';
import * as api from '../api/notification.api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isFetchingMore: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },

  fetchNotifications: async (page = 1) => {
    if (page === 1) set({ isLoading: true, error: null });
    else set({ isFetchingMore: true, error: null });

    try {
      const res = await api.getNotifications(page);
      
      set((state) => ({
        notifications: page === 1 ? res.data : [...state.notifications, ...res.data],
        pagination: res.pagination,
        isLoading: false,
        isFetchingMore: false,
      }));
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch notifications',
        isLoading: false,
        isFetchingMore: false
      });
    }
  },

  loadMore: () => {
    const { pagination, isFetchingMore, fetchNotifications } = get();
    if (!isFetchingMore && pagination.page < pagination.pages) {
      fetchNotifications(pagination.page + 1);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.getUnreadCount();
      set({ unreadCount: res.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  },

  incrementUnreadCount: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  },

  addLiveNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  markAsRead: async (id) => {
    try {
      // Optimistic update
      set((state) => {
        const item = state.notifications.find(n => n._id === id);
        if (!item || item.read) return state; // Already read or not found
        
        return {
          notifications: state.notifications.map(n => 
            n._id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
      });

      await api.markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }));

      await api.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  },

  deleteNotification: async (id) => {
    try {
      const { notifications } = get();
      const isUnread = notifications.find(n => n._id === id && !n.read);
      
      set((state) => ({
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: isUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      }));

      await api.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  },
}));

export default useNotificationStore;
