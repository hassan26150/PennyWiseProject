import api from './client';

/**
 * Price Comparison API functions
 */

// Get comparison prices for a product
export const fetchComparePrices = async (productId) => {
  const response = await api.get(`/products/${productId}/compare-prices`);
  return response;
};

// Get price history for charts
export const fetchPriceHistory = async (productId, days = 30) => {
  const response = await api.get(`/products/${productId}/price-history?days=${days}`);
  return response;
};
