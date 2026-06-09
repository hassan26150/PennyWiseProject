import api from './client';

export const getCart = () => api.get('/cart');
export const addToCart = (product_id, quantity = 1) => api.post('/cart/items', { product_id, quantity });
export const updateCartItem = (itemId, quantity) => api.patch(`/cart/items/${itemId}`, { quantity });
export const removeCartItem = (itemId) => api.delete(`/cart/items/${itemId}`);
export const clearCart = () => api.delete('/cart');
