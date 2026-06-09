import api from './client';

// ── Buyer Orders ──
export const checkout = (shipping_address, payment_method = 'COD') => 
  api.post('/orders', { shipping_address, payment_method });

export const getBuyerOrders = () => api.get('/orders');
export const getOrderDetails = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id) => api.delete(`/orders/${id}`);
export const getOrderInvoice = (id) => api.get(`/orders/${id}/invoice`);

// ── Seller Orders ──
export const getSellerOrders = (status) => api.get(`/seller/orders${status ? `?status=${status}` : ''}`);
export const confirmOrder = (id) => api.patch(`/seller/orders/${id}/confirm`);
export const processOrder = (id) => api.patch(`/seller/orders/${id}/process`);
export const shipOrder = (id, tracking_number) => api.patch(`/seller/orders/${id}/ship`, { tracking_number });
export const deliverOrder = (id) => api.patch(`/seller/orders/${id}/deliver`);
export const cancelSellerOrder = (id) => api.patch(`/seller/orders/${id}/cancel`);

// ── Analytics ──
export const trackExternalClick = (product_id, platform, external_url) => 
  api.post('/analytics/external-click', { product_id, platform, external_url });
