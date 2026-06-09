import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import useProductStore from '../../store/productStore';
import useNotificationStore from '../../store/notificationStore';
import useRecommendationStore from '../../store/recommendationStore';

interface BuyerHomeProps {
  onNavigate: (screen: string) => void;
  onSelectProduct: (product: any) => void;
}

export default function BuyerHome({ onNavigate, onSelectProduct }: BuyerHomeProps) {
  const { publicProducts, fetchPublicProducts, isLoading } = useProductStore();
  const { unreadCount } = useNotificationStore();
  const { recommendations, fetchRecommendations } = useRecommendationStore();

  useEffect(() => {
    fetchPublicProducts({ limit: 10 });
    fetchRecommendations();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      
      {/* Header */}
      <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View>
          <Text style={styles.title}>
            Penny<Text style={{ fontWeight: '400' }}>Wise</Text>
          </Text>
          <Text style={styles.subtitle}>Compare Smart. Spend Wise.</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigate('notifications')} style={{ padding: 8, position: 'relative' }}>
          <Feather name="bell" size={24} color={COLORS.primary} />
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'red', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar} onPress={() => onNavigate('search')}>
        <Feather name="search" size={20} color="#005461" />
        <Text style={styles.searchText}>Search for products...</Text>
      </TouchableOpacity>

      {/* AI Chatbot Button */}
      <TouchableOpacity style={styles.chatbotButton} onPress={() => onNavigate('chatbot')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.chatIcon}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
          </View>
          <View>
            <Text style={{ fontWeight: '500', color: 'white' }}>Ask PennyWise AI</Text>
            <Text style={{ fontSize: 12, color: 'white', opacity: 0.8 }}>Find best deals instantly</Text>
          </View>
        </View>
        <View style={styles.sparkIcon}>
          <Text style={{ fontSize: 18 }}>✨</Text>
        </View>
      </TouchableOpacity>

      {/* Recommended For You Section */}
      <View style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>Recommended For You</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
          {recommendations.map((rec, index) => {
            const item = rec.product_id;
            if (!item) return null;
            return (
              <TouchableOpacity key={`rec-${item._id}-${index}`} style={[styles.productCard, { width: 160 }]} onPress={() => onSelectProduct(item)}>
                {item.thumbnail ? (
                  <Image source={{ uri: item.thumbnail }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Feather name="image" size={32} color="#D1D5DB" />
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productPrice}>PKR {(item.lowest_market_price || 0).toLocaleString()}</Text>
                  <View style={styles.ratingContainer}>
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.average_rating || 0}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Latest Products</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {(publicProducts || []).map((product: any) => (
              <TouchableOpacity
                key={product._id}
                style={styles.featuredCard}
                onPress={() => {
                  onSelectProduct(product);
                  onNavigate('product');
                }}
              >
                {/* Badge */}
                <Text style={styles.featuredBadge}>✓ PennyWise</Text>

                <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                  {product.thumbnail ? (
                    <Image source={{ uri: product.thumbnail }} style={{ width: 80, height: 80, borderRadius: RADIUS.md }} />
                  ) : (
                    <Feather name="image" size={40} color="#ccc" />
                  )}
                </View>
                <Text style={{ fontSize: 14, marginVertical: 5 }} numberOfLines={2}>{product.name}</Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>⭐ {product.average_rating || 0}</Text>
                <Text style={{ color: '#005461', fontWeight: 'bold', fontSize: 16 }}>PKR {product.price.toLocaleString()}</Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>{product.seller_id?.storeName || 'Unknown Store'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 15 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.primary },
  subtitle: { color: COLORS.textSecondary },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.card, padding: 15, borderRadius: 30, marginBottom: 15 },
  searchText: { color: COLORS.textSecondary, marginLeft: 10 },
  chatbotButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.primary, padding: 15, borderRadius: 30, marginBottom: 20 },
  chatIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 25 },
  sparkIcon: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 25 },
  priceDropCard: { backgroundColor: COLORS.card, padding: 15, borderRadius: RADIUS.xl, width: 280, marginRight: 10 },
  productImage: { width: 60, height: 60, borderRadius: 15, backgroundColor: COLORS.accentTint, alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: COLORS.primary, color: COLORS.white, fontSize: 10, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10 },
  externalBadge: { backgroundColor: COLORS.textSecondary, color: COLORS.white, fontSize: 10, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10 },
  discountBadge: { backgroundColor: COLORS.success, color: COLORS.white, fontSize: 10, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10 },
  featuredCard: { backgroundColor: COLORS.card, width: '48%', padding: 15, borderRadius: RADIUS.xl, marginBottom: 10 },
  featuredBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.primary, color: COLORS.white, fontSize: 10, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10 },
  featuredExternal: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.textSecondary, color: COLORS.white, fontSize: 10, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10 },
  featuredDiscount: { position: 'absolute', top: 10, right: 10, backgroundColor: COLORS.success, color: COLORS.white, fontSize: 10, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 10 },
});
