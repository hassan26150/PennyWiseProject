import { create } from 'zustand';
import * as api from '../api/favorite.api';

const useFavoriteStore = create((set, get) => ({
  favoriteItems: [],
  favoritedIds: new Set(),
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getFavorites();
      const items = res.data || [];
      const ids = new Set(items.map(item => item.product_id._id));
      
      set({ 
        favoriteItems: items,
        favoritedIds: ids,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch favorites',
        isLoading: false 
      });
    }
  },

  toggleFavorite: async (productId) => {
    const { favoritedIds } = get();
    const isCurrentlyFavorited = favoritedIds.has(productId);

    // Optimistic update
    set((state) => {
      const newSet = new Set(state.favoritedIds);
      if (isCurrentlyFavorited) {
        newSet.delete(productId);
        return {
          favoritedIds: newSet,
          favoriteItems: state.favoriteItems.filter(item => item.product_id._id !== productId)
        };
      } else {
        newSet.add(productId);
        return { favoritedIds: newSet };
      }
    });

    try {
      if (isCurrentlyFavorited) {
        await api.removeFromFavorites(productId);
      } else {
        const res = await api.addToFavorites(productId);
        set((state) => ({
          favoriteItems: [res.data, ...state.favoriteItems]
        }));
      }
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      get().fetchFavorites();
    }
  },

  isFavorited: (productId) => {
    return get().favoritedIds.has(productId);
  }
}));

export default useFavoriteStore;
