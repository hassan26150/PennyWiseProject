import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';
import useFavoriteStore from '../../store/favoriteStore';

interface FavoritesProps {
  onNavigate: (screen: string) => void;
  onSelectProduct: (product: any) => void;
  showPriceDrops?: boolean;
}


export default function Favorites({ onNavigate, onSelectProduct, showPriceDrops = false }: FavoritesProps) {
  const { favoriteItems, toggleFavorite, fetchFavorites, isLoading } = useFavoriteStore();
  const isPriceDropMode = showPriceDrops;

  React.useEffect(() => {
    fetchFavorites();
  }, []);

  // Format real items to match the expected UI properties
  const displayItems = favoriteItems.map(item => {
    const p = item.product_id;
    if (!p) return null;
    return {
      id: p._id,
      name: p.name,
      price: p.price || 0, // Note: real products might not have 'price' directly on master product, but they do have lowest_market_price
      image: p.thumbnail,
      rating: p.average_rating || 0,
      type: 'in-app', // Can be dynamically set
      seller: p.seller_id?.store_name || 'PennyWise',
      // Mocked discount for price drop view (real implementation would filter by price drop notification)
      discount: isPriceDropMode ? 'Price Dropped' : null,
      originalPrice: isPriceDropMode ? (p.price || 0) + 1000 : null
    };
  }).filter(Boolean);

  return (
    <LinearGradient colors={['#00546105', '#fff', '#00B7B505']} style={{ flex: 1, paddingBottom: 24 }}>
      {/* Header */}
      <LinearGradient
        colors={isPriceDropMode ? ['#10B981', '#059669'] : ['#005461', '#00B7B5']}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
      >
        <TouchableOpacity onPress={() => onNavigate('home')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
          {isPriceDropMode ? (
            <MaterialCommunityIcons name="trending-down" size={24} color="#fff" />
          ) : (
            <Feather name="heart" size={24} color="#fff" />
          )}
          <Text style={{ color: '#fff', fontSize: 20, marginLeft: 6 }}>
            {isPriceDropMode ? 'Price Drop Alerts' : 'My Favorites'}
          </Text>
        </View>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ color: '#fff', fontSize: 12 }}>{displayItems.length} items</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {displayItems.length === 0 ? (
          <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
            {isPriceDropMode ? (
              <>
                <MaterialCommunityIcons name="trending-down" size={64} color="#D1D5DB" />
                <Text style={{ color: '#6B7280', marginVertical: 12 }}>No price drops yet</Text>
              </>
            ) : (
              <>
                <Feather name="heart" size={64} color="#D1D5DB" />
                <Text style={{ color: '#6B7280', marginVertical: 12 }}>No favorites yet</Text>
              </>
            )}
            <TouchableOpacity
              onPress={() => onNavigate('home')}
              style={{ backgroundColor: '#005461', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
            >
              <Text style={{ color: '#fff', fontWeight: '500' }}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {displayItems.map((product) => (
              <View key={product.id} style={{ width: '48%', backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 16 }}>
                {/* Corner gradient or discount badge */}
                {isPriceDropMode && (product as any).discount ? (
                  <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#10B981', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>{(product as any).discount} OFF</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 16, padding: 4, zIndex: 10 }} 
                    onPress={() => toggleFavorite(product.id)}
                  >
                    <Feather name="heart" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => { onSelectProduct(product); onNavigate('product'); }}>
                  {/* Product type badge */}
                  <View style={{ marginBottom: 6 }}>
                    {product.type === 'in-app' ? (
                      <View style={{ backgroundColor: '#005461', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontSize: 10 }}>✓ PennyWise</Text>
                      </View>
                    ) : (
                      <View style={{ backgroundColor: '#6B7280', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontSize: 10 }}>{(product as any).website?.split('.')[0]}</Text>
                      </View>
                    )}
                  </View>

                  {product.image && typeof product.image === 'string' && product.image.startsWith('http') ? (
                    <Image source={{ uri: product.image }} style={{ width: '100%', height: 100, resizeMode: 'contain' }} />
                  ) : (
                    <Text style={{ fontSize: 40, textAlign: 'center' }}>{product.image || '📦'}</Text>
                  )}
                  <Text style={{ fontSize: 12, fontWeight: '500', marginVertical: 4 }}>{product.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text style={{ fontSize: 10, color: '#4B5563', marginLeft: 2 }}>{product.rating}</Text>
                  </View>

                  {isPriceDropMode && 'originalPrice' in product ? (
                    <View>
                      <Text style={{ fontSize: 10, color: '#9CA3AF', textDecorationLine: 'line-through' }}>PKR {(product as any).originalPrice.toLocaleString()}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '500', color: '#005461' }}>PKR {product.price.toLocaleString()}</Text>
                      <Text style={{ fontSize: 10, color: '#10B981' }}>Save PKR {((product as any).originalPrice - product.price).toLocaleString()}</Text>
                    </View>
                  ) : (
                    <>
                      {(product as any).lowestPrice && (
                        <View style={{ backgroundColor: '#10B981', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 }}>
                          <Text style={{ color: '#fff', fontSize: 10 }}>Lowest Price</Text>
                        </View>
                      )}
                      <Text style={{ fontSize: 12, fontWeight: '500', color: '#005461' }}>PKR {product.price.toLocaleString()}</Text>
                    </>
                  )}

                  {product.seller && <Text style={{ fontSize: 10, color: '#6B7280' }}>{product.seller}</Text>}
                  {product.type === 'external' && product.website && <Text style={{ fontSize: 10, color: '#6B7280' }}>{product.website}</Text>}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
