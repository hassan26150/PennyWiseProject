import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import useProductStore from '../../store/productStore';

interface ProductApprovalProps {
  onNavigate: (screen: string) => void;
}

export default function ProductApproval({ onNavigate }: ProductApprovalProps) {
  const { pendingProducts, fetchPendingProducts, approveProduct, rejectProduct, isLoading, error } = useProductStore();

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Approvals</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{pendingProducts.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer}>
        {error ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
          </View>
        ) : isLoading && pendingProducts.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : pendingProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>No pending product approvals</Text>
          </View>
        ) : (
          pendingProducts.map((product: any) => (
            <View key={product._id} style={styles.productCard}>
              {/* Product Header */}
              <View style={styles.productHeader}>
                {product.thumbnail ? (
                  <Image source={{ uri: product.thumbnail }} style={styles.productIcon} />
                ) : (
                  <View style={[styles.productIcon, { backgroundColor: '#ccc' }]}>
                    <Feather name="image" size={24} color="#fff" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.sellerText}>Seller: {product.seller_id?.store_name || 'Unknown'}</Text>
                  <Text style={styles.priceText}>PKR {product.price}</Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.details}>
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {product.description}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                  onPress={() => approveProduct(product._id)}
                  disabled={isLoading}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                  onPress={() => rejectProduct(product._id, 'Rejected by Admin')}
                  disabled={isLoading}
                >
                  <Ionicons name="close-circle" size={18} color="#fff" />
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.primary, marginLeft: 8 },
  countBadge: { marginLeft: 'auto', backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.md },
  countText: { color: '#fff', fontSize: 12 },
  listContainer: { flex: 1, padding: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: COLORS.primary },
  emptyText: { color: COLORS.secondary, fontSize: 14 },
  productCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  productHeader: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  productIcon: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  productName: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 2 },
  sellerText: { fontSize: 12, color: COLORS.textSecondary },
  priceText: { fontSize: 14, color: COLORS.primary, fontWeight: 'bold', marginTop: 2 },
  details: { marginBottom: 12 },
  descriptionText: { fontSize: 12, color: COLORS.textSecondary, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: RADIUS.md },
  actionText: { color: '#fff', fontSize: 12, marginLeft: 4, fontWeight: '500' },
});
