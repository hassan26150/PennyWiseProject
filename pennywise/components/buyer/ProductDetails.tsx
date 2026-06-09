// ProductDetails.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, Linking, Dimensions, Modal, TextInput } from 'react-native';
import { Feather, FontAwesome, MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../theme';
import useProductStore from '../../store/productStore';
import useCartStore from '../../store/cartStore';
import useOrderStore from '../../store/orderStore';
import useFavoriteStore from '../../store/favoriteStore';
import usePriceAlertStore from '../../store/priceAlertStore';
import { trackView } from '../../api/analytics.api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductDetailsProps {
  product: any;
  onNavigate: (screen: string) => void;
  showComparison?: boolean;
}

export default function ProductDetails({ product, onNavigate, showComparison = false }: ProductDetailsProps) {
  const { 
    currentProduct,
    fetchProductDetails,
    recordProductView, 
    fetchComparePrices, 
    fetchPriceHistory,
    comparisonPrices, 
    comparisonStats, 
    priceHistory,
    isComparisonLoading,
    comparisonError,
    clearComparison,
  } = useProductStore();
  
  const { addToCart } = useCartStore();
  const { trackExternalClick } = useOrderStore();
  const { toggleFavorite, isFavorited, fetchFavorites } = useFavoriteStore();
  const { createAlert } = usePriceAlertStore();

  const [isAlertModalVisible, setAlertModalVisible] = useState(false);
  const [targetPrice, setTargetPrice] = useState(product?.lowest_market_price?.toString() || '');

  const isProductWatched = isFavorited(product?._id);

  useEffect(() => {
    fetchFavorites();
    if (product?._id) {
      fetchProductDetails(product._id);
      fetchComparePrices(product._id);
      trackView(product._id).catch(err => console.log('Analytics view failed', err));
      fetchPriceHistory(product._id, 30);
    }
    return () => clearComparison();
  }, [product?._id]);

  const handleSetAlert = async () => {
    try {
      await createAlert(product._id, Number(targetPrice));
      setAlertModalVisible(false);
      alert('Price alert set successfully!');
    } catch (e) {
      alert('Failed to set price alert');
    }
  };

  const displayProduct = currentProduct || product;

  if (!displayProduct) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Determine availability
  const marketplaceOffers = displayProduct.marketplaceOffers || [];
  const hasPennyWiseOffer = displayProduct.source === 'internal' || marketplaceOffers.length > 0;
  const purchasableProduct = displayProduct.source === 'internal' ? displayProduct : (marketplaceOffers[0] || null);
  const stockQuantity = purchasableProduct ? purchasableProduct.stock_quantity : 0;

  const handleVisitStore = (url: string, platform: string = 'Unknown') => {
    if (url) {
      if (displayProduct?._id) {
        trackExternalClick(displayProduct._id, platform, url);
      }
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open the URL');
      });
    }
  };

  const handleAddToCart = async () => {
    try {
      if (hasPennyWiseOffer && purchasableProduct) {
        // Use the internal product ID or the specific variant ID
        await addToCart(purchasableProduct._id || displayProduct._id, 1);
        Alert.alert('Success', 'Added to cart successfully!', [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => onNavigate('cart') }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not add to cart');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setAlertModalVisible(true)}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => toggleFavorite(displayProduct._id)}>
            <Ionicons
              name={isProductWatched ? "heart" : "heart-outline"}
              size={24}
              color={isProductWatched ? "#EF4444" : "white"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image */}
        <View style={styles.imageCarousel}>
          {/* Badge */}
          <View style={styles.badge}>
            {hasPennyWiseOffer ? (
              <View style={styles.inAppBadge}>
                <MaterialIcons name="check-circle" size={16} color="white" />
                <Text style={styles.badgeText}>Available on PennyWise</Text>
              </View>
            ) : (
              <View style={styles.externalBadge}>
                <MaterialIcons name="open-in-new" size={16} color="white" />
                <Text style={styles.badgeText}>External Discovery</Text>
              </View>
            )}
          </View>

          {/* Lowest Price Badge */}
          {comparisonStats && comparisonStats.bestPlatform === 'PennyWise' && (
            <View style={styles.lowestPriceBadge}>
              <Text style={styles.lowestPriceBadgeText}>🏆 Lowest Price</Text>
            </View>
          )}

          {displayProduct.thumbnail ? (
            <Image source={{ uri: displayProduct.thumbnail }} style={styles.productImage} resizeMode="contain" />
          ) : (
             <Feather name="image" size={100} color="#ccc" style={{ marginBottom: 20 }} />
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{displayProduct.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.mainPriceText}>PKR {(displayProduct.price || 0).toLocaleString()}</Text>
            {comparisonStats && comparisonStats.savings > 0 && comparisonStats.bestPlatform === 'PennyWise' && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save PKR {comparisonStats.savings.toLocaleString()}</Text>
              </View>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color="#FBBF24" />
            <Text style={styles.ratingText}>{displayProduct.average_rating || 0}</Text>
            <Text style={styles.reviewText}>({displayProduct.total_reviews || 0} reviews)</Text>
            <View style={{ flex: 1 }} />
            <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Views: {displayProduct.total_views || 0}</Text>
          </View>

          {/* Store info */}
          {hasPennyWiseOffer ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <MaterialCommunityIcons name="store" size={20} color={COLORS.textSecondary} />
              <Text style={{ marginLeft: 6, fontSize: 14, color: COLORS.textSecondary }}>
                Sold by: {purchasableProduct?.seller_id?.storeName || 'PennyWise'}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <MaterialCommunityIcons name="web" size={20} color={COLORS.textSecondary} />
              <Text style={{ marginLeft: 6, fontSize: 14, color: COLORS.textSecondary }}>
                Available on External Stores
              </Text>
            </View>
          )}

          {/* COD Info */}
          {hasPennyWiseOffer && (
            <View style={styles.codInfo}>
              <View style={styles.codHeader}>
                <View style={styles.codIcon}>
                  <MaterialCommunityIcons name="cart" size={16} color="white" />
                </View>
                <Text style={styles.codTitle}>Payment Method</Text>
              </View>
              <Text style={styles.codText}>💵 Cash on Delivery (COD) Available</Text>
              <Text style={styles.codSubText}>Pay when you receive your order</Text>
            </View>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* COMPARE PRICES SECTION */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.compareSection}>
            <View style={styles.compareSectionHeader}>
              <View style={styles.compareSectionIcon}>
                <MaterialCommunityIcons name="scale-balance" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.compareSectionTitle}>Compare Prices</Text>
                <Text style={styles.compareSectionSubtitle}>Across Pakistani e-commerce stores</Text>
              </View>
              {comparisonStats && (
                <View style={styles.platformCountBadge}>
                  <Text style={styles.platformCountText}>{comparisonStats.totalPlatforms} stores</Text>
                </View>
              )}
            </View>

            {isComparisonLoading ? (
              <View style={styles.compareLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.compareLoadingText}>Searching across stores...</Text>
              </View>
            ) : comparisonError ? (
              <View style={styles.compareError}>
                <Feather name="alert-circle" size={16} color="#F59E0B" />
                <Text style={styles.compareErrorText}>Comparison data unavailable</Text>
              </View>
            ) : comparisonPrices.length > 0 ? (
              <View>
                {/* Market Stats Bar */}
                {comparisonStats && (
                  <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Lowest</Text>
                      <Text style={[styles.statValue, { color: '#10B981' }]}>
                        PKR {comparisonStats.lowestPrice?.toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.statDivider]} />
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Average</Text>
                      <Text style={styles.statValue}>
                        PKR {comparisonStats.averagePrice?.toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.statDivider]} />
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Highest</Text>
                      <Text style={[styles.statValue, { color: '#EF4444' }]}>
                        PKR {comparisonStats.highestPrice?.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Price Comparison List */}
                {comparisonPrices.map((item: any, index: number) => {
                  const isLowest = comparisonStats && item.price === comparisonStats.lowestPrice;
                  const isPennyWise = item.platform.startsWith('PennyWise');

                  return (
                    <View
                      key={`${item.platform}-${index}`}
                      style={[
                        styles.compareRow,
                        isPennyWise && styles.compareRowHighlight,
                        isLowest && styles.compareRowLowest,
                      ]}
                    >
                      <View style={styles.compareRowLeft}>
                        <View style={styles.platformIconBox}>
                          {isPennyWise ? (
                            <MaterialCommunityIcons name="shield-check" size={20} color="#005461" />
                          ) : (
                            <MaterialCommunityIcons name="store-outline" size={20} color="#6B7280" />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.platformName, isPennyWise && { color: '#005461', fontWeight: '700' }]}>
                              {item.platform}
                            </Text>
                            {isLowest && (
                              <View style={styles.lowestTag}>
                                <Text style={styles.lowestTagText}>LOWEST</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.compareProductName} numberOfLines={1}>
                            {item.product_name}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            {item.in_stock ? (
                              <Text style={{ fontSize: 10, color: '#10B981' }}>✓ In Stock</Text>
                            ) : (
                              <Text style={{ fontSize: 10, color: '#EF4444' }}>✗ Out of Stock</Text>
                            )}
                            {item.rating ? (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <FontAwesome name="star" size={10} color="#FBBF24" />
                                <Text style={{ fontSize: 10, color: '#6B7280' }}>{item.rating}</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </View>

                      <View style={styles.compareRowRight}>
                        <Text style={[styles.comparePrice, isLowest && { color: '#10B981' }]}>
                          PKR {item.price?.toLocaleString()}
                        </Text>
                        {!isPennyWise && item.url ? (
                          <TouchableOpacity 
                            style={styles.visitBtn}
                            onPress={() => handleVisitStore(item.url, item.platform)}
                          >
                            <Text style={styles.visitBtnText}>Visit Store</Text>
                            <Feather name="external-link" size={10} color="#005461" />
                          </TouchableOpacity>
                        ) : isPennyWise ? (
                          <View style={styles.pennyWiseBadge}>
                            <Text style={styles.pennyWiseBadgeText}>You're here</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.compareEmpty}>
                <MaterialCommunityIcons name="store-search-outline" size={32} color="#9CA3AF" />
                <Text style={styles.compareEmptyText}>No comparison data available yet</Text>
              </View>
            )}
          </View>

          {/* ═══════════════════════════════════════════ */}
          {/* PRICE HISTORY CHART */}
          {/* ═══════════════════════════════════════════ */}
          {priceHistory && (
            <View style={styles.chartSection}>
              <View style={styles.compareSectionHeader}>
                <View style={[styles.compareSectionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="trending-up" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.compareSectionTitle}>Price History</Text>
                  <Text style={styles.compareSectionSubtitle}>Last 30 days</Text>
                </View>
              </View>

              <PriceHistoryChart data={priceHistory} currentPrice={displayProduct.price} />
            </View>
          )}

          {/* Description */}
          <View style={styles.description}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionText}>
              {displayProduct.description || 'No description available for this product.'}
            </Text>
          </View>

          {/* Specifications */}
          <View style={styles.specs}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Category</Text>
              <Text style={styles.specValue}>{displayProduct.category_id?.name || 'N/A'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Stock Status</Text>
              <Text style={styles.specValue}>
                {hasPennyWiseOffer ? (stockQuantity > 0 ? `${stockQuantity} available` : 'Out of stock') : 'Check external stores'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        {hasPennyWiseOffer ? (
          <TouchableOpacity 
            style={[styles.addToCartButton, stockQuantity === 0 && { backgroundColor: '#ccc' }]} 
            onPress={handleAddToCart} 
            disabled={stockQuantity === 0}
          >
            <MaterialCommunityIcons name="cart" size={20} color="white" />
            <Text style={styles.bottomButtonText}>{stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.visitWebsiteButton}
            onPress={() => {
              const bestOffer = comparisonPrices.find((p: any) => p.url);
              if (bestOffer?.url) {
                handleVisitStore(bestOffer.url, bestOffer.platform);
              } else {
                Alert.alert('Info', 'Please select a store from the comparison list above.');
              }
            }}
          >
            <MaterialIcons name="open-in-new" size={20} color="white" />
            <Text style={styles.bottomButtonText}>View External Offers</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* PRICE ALERT MODAL */}
      <Modal
        visible={isAlertModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAlertModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Set Price Alert</Text>
              <TouchableOpacity onPress={() => setAlertModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#6B7280', marginBottom: 16 }}>
              Current lowest price is PKR {(product.lowest_market_price || 0).toLocaleString()}. What is your target price?
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 50000"
              value={targetPrice}
              onChangeText={setTargetPrice}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleSetAlert}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Set Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


/* ═══════════════════════════════════════════ */
/* MINI PRICE HISTORY CHART COMPONENT         */
/* ═══════════════════════════════════════════ */
function PriceHistoryChart({ data, currentPrice }: { data: any, currentPrice: number }) {
  const pennyWiseData = data?.pennywise || [];
  const platforms = data?.platforms || {};

  // Collect all price points
  const allPoints: { price: number, label: string }[] = [];

  // Add PennyWise points
  pennyWiseData.forEach((p: any) => {
    allPoints.push({ price: p.price, label: 'PennyWise' });
  });

  // Add platform points
  Object.entries(platforms).forEach(([platform, points]: [string, any]) => {
    (points || []).forEach((p: any) => {
      allPoints.push({ price: p.price, label: platform });
    });
  });

  if (allPoints.length === 0) {
    // Show at least the current price
    allPoints.push({ price: currentPrice, label: 'PennyWise' });
  }

  const prices = allPoints.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  // Simple SVG-style bar chart using Views
  const chartWidth = SCREEN_WIDTH - 80;
  const chartHeight = 80;

  // Group by platform for the legend
  const platformNames = [...new Set(allPoints.map(p => p.label))];

  return (
    <View style={styles.chartContainer}>
      {/* Chart visualization using simple bars */}
      <View style={styles.chartBars}>
        {allPoints.slice(-10).map((point, idx) => {
          const heightPercent = ((point.price - minPrice) / range) * 100;
          const barHeight = Math.max(8, (heightPercent / 100) * chartHeight);
          const isPW = point.label === 'PennyWise';
          return (
            <View key={idx} style={styles.chartBarCol}>
              <Text style={styles.chartBarPrice}>
                {(point.price / 1000).toFixed(0)}K
              </Text>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: barHeight,
                    backgroundColor: isPW ? '#005461' : '#00B7B5',
                  },
                ]}
              />
              <Text style={styles.chartBarLabel} numberOfLines={1}>
                {point.label.substring(0, 3)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Price range labels */}
      <View style={styles.chartRange}>
        <Text style={styles.chartRangeText}>Low: PKR {minPrice.toLocaleString()}</Text>
        <Text style={styles.chartRangeText}>High: PKR {maxPrice.toLocaleString()}</Text>
      </View>

      {/* Legend */}
      <View style={styles.chartLegend}>
        {platformNames.slice(0, 4).map((name, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[
              styles.legendDot,
              { backgroundColor: name === 'PennyWise' ? '#005461' : '#00B7B5' }
            ]} />
            <Text style={styles.legendText}>{name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#005461', padding: 12 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  imageCarousel: { alignItems: 'center', paddingVertical: 20, backgroundColor: 'rgba(0,183,181,0.1)' },
  productImage: { width: 250, height: 250, marginBottom: 12, borderRadius: RADIUS.md },
  badge: { position: 'absolute', top: 8, left: 8, zIndex: 10 },
  inAppBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#005461', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  externalBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4B5563', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: 'white', marginLeft: 4, fontSize: 12 },
  lowestPriceBadge: {
    position: 'absolute', top: 8, right: 8, zIndex: 10,
    backgroundColor: '#10B981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  lowestPriceBadgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  savingsBadge: {
    backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
    borderWidth: 1, borderColor: '#10B981',
  },
  savingsText: { color: '#10B981', fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 12 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', padding: 12, borderRadius: 8, marginBottom: 16 },
  primaryButton: { backgroundColor: '#005461', padding: 14, borderRadius: 8, alignItems: 'center' },
  infoContainer: { padding: 16 },
  productName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  mainPriceText: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingText: { marginLeft: 4, fontSize: 14 },
  reviewText: { marginLeft: 4, fontSize: 12, color: '#6B7280' },
  codInfo: { backgroundColor: 'rgba(0,183,181,0.1)', padding: 12, borderRadius: 16, marginBottom: 12 },
  codHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  codIcon: { backgroundColor: '#00B7B5', padding: 4, borderRadius: 20 },
  codTitle: { marginLeft: 8, fontWeight: '600', fontSize: 14 },
  codText: { fontSize: 12, color: '#4B5563' },
  codSubText: { fontSize: 10, color: '#6B7280' },

  // ── Compare Prices Section ──
  compareSection: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  compareSectionHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10,
    backgroundColor: '#F8FFFE', borderBottomWidth: 1, borderColor: '#E5E7EB',
  },
  compareSectionIcon: {
    backgroundColor: '#005461', width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  compareSectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  compareSectionSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  platformCountBadge: {
    backgroundColor: '#E0F2F1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  platformCountText: { fontSize: 11, color: '#005461', fontWeight: '600' },

  compareLoading: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10,
  },
  compareLoadingText: { fontSize: 13, color: '#6B7280' },

  compareError: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 8,
  },
  compareErrorText: { fontSize: 13, color: '#F59E0B' },

  compareEmpty: {
    alignItems: 'center', justifyContent: 'center', padding: 30, gap: 8,
  },
  compareEmptyText: { fontSize: 13, color: '#9CA3AF' },

  statsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: 12, paddingHorizontal: 8,
    backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 13, fontWeight: '700', color: '#374151' },
  statDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },

  compareRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: '#F3F4F6',
  },
  compareRowHighlight: { backgroundColor: '#F0FDFA' },
  compareRowLowest: { borderLeftWidth: 3, borderLeftColor: '#10B981' },
  compareRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  compareRowRight: { alignItems: 'flex-end', gap: 4 },
  platformIconBox: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  platformName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  compareProductName: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  comparePrice: { fontSize: 15, fontWeight: '700', color: '#374151' },
  lowestTag: {
    backgroundColor: '#ECFDF5', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
  },
  lowestTagText: { fontSize: 8, fontWeight: '800', color: '#10B981', letterSpacing: 0.5 },
  visitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: '#005461',
  },
  visitBtnText: { fontSize: 11, color: '#005461', fontWeight: '600' },
  pennyWiseBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#E0F2F1',
  },
  pennyWiseBadgeText: { fontSize: 10, color: '#005461', fontWeight: '500' },

  // ── Price History Chart Section ──
  chartSection: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  chartContainer: { padding: 14 },
  chartBars: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around',
    height: 110, paddingTop: 16,
  },
  chartBarCol: { alignItems: 'center', flex: 1 },
  chartBar: { width: 18, borderRadius: 4, marginVertical: 4 },
  chartBarPrice: { fontSize: 8, color: '#6B7280' },
  chartBarLabel: { fontSize: 8, color: '#9CA3AF', marginTop: 2 },
  chartRange: {
    flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8,
    borderTopWidth: 1, borderColor: '#F3F4F6', marginTop: 8,
  },
  chartRangeText: { fontSize: 10, color: '#9CA3AF' },
  chartLegend: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: '#6B7280' },

  // ── Existing styles ──
  description: { backgroundColor: 'white', padding: 12, borderRadius: 16, marginBottom: 12 },
  sectionTitle: { fontWeight: '600', marginBottom: 6 },
  sectionText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  specs: { backgroundColor: 'white', padding: 12, borderRadius: 16, marginBottom: 20 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  specKey: { fontSize: 12, color: '#6B7280' },
  specValue: { fontSize: 12, fontWeight: '500' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#E5E7EB' },
  addToCartButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#005461', paddingVertical: 12, borderRadius: 16 },
  visitWebsiteButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#4B5563', paddingVertical: 12, borderRadius: 16 },
  bottomButtonText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 8 },
});
