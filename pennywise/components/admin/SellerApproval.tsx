import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import * as adminApi from '../../api/admin.api';

interface SellerApprovalProps {
  onNavigate: (screen: string) => void;
}

export default function SellerApproval({ onNavigate }: SellerApprovalProps) {
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);

  const fetchSellers = async () => {
    try {
      const res = await adminApi.getPendingSellers();
      setPendingSellers(res.data);
    } catch (e) {
      console.log('Error fetching pending sellers:', e);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleApprove = async (seller: any) => {
    try {
      await adminApi.approveSeller(seller._id);
      Alert.alert('Approved', `${seller.store_name || 'Seller'} has been approved.`);
      fetchSellers();
    } catch (e) {
      Alert.alert('Error', 'Failed to approve seller');
    }
  };

  const handleReject = async (seller: any) => {
    try {
      await adminApi.rejectSeller(seller._id, 'Application does not meet our requirements');
      Alert.alert('Rejected', `${seller.store_name || 'Seller'} application has been rejected.`);
      fetchSellers();
    } catch (e) {
      Alert.alert('Error', 'Failed to reject seller');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Approvals</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{pendingSellers.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer}>
        {pendingSellers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>No pending seller approvals</Text>
          </View>
        ) : (
          pendingSellers.map((seller) => (
            <View key={seller._id} style={styles.sellerCard}>
              {/* Seller Header */}
              <View style={styles.sellerHeader}>
                <View style={styles.storeIcon}>
                  <MaterialCommunityIcons name="store" size={24} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeName}>{seller.store_name || 'Unnamed Store'}</Text>
                  <Text style={styles.ownerText}>Owner: {seller.user_id?.name || 'N/A'}</Text>
                  <Text style={styles.registeredText}>Registered: {new Date(seller.created_at).toLocaleDateString()}</Text>
                </View>
              </View>

              {/* Seller Details */}
              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Feather name="mail" size={16} color={COLORS.accent} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{seller.user_id?.email || 'N/A'}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Feather name="phone" size={16} color={COLORS.accent} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{seller.user_id?.phone || 'N/A'}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Feather name="map-pin" size={16} color={COLORS.accent} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{seller.store_location || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              {/* Documents */}
              <View style={styles.documents}>
                <Text style={styles.documentsLabel}>Store Details:</Text>
                <View style={styles.documentsList}>
                  <View style={styles.documentItem}>
                    <Text style={styles.documentText}>📝 Description: {seller.store_description || 'None provided'}</Text>
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                  onPress={() => Alert.alert('Confirm', 'Are you sure you want to approve this seller?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes', onPress: () => handleApprove(seller) }
                  ])}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.actionText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                  onPress={() => Alert.alert('Confirm', 'Are you sure you want to reject this seller?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes', onPress: () => handleReject(seller) }
                  ])}
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
  sellerCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  sellerHeader: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  storeIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  storeName: { fontSize: 16, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 2 },
  ownerText: { fontSize: 12, color: COLORS.textSecondary },
  registeredText: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  details: { marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailLabel: { fontSize: 10, color: COLORS.textSecondary },
  detailValue: { fontSize: 12, color: COLORS.textPrimary },
  documents: { backgroundColor: COLORS.primaryTint, borderRadius: RADIUS.md, padding: 8, marginBottom: 8, borderWidth: 1, borderColor: COLORS.secondaryTint },
  documentsLabel: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 4 },
  documentsList: { flexDirection: 'row', gap: 4 },
  documentItem: { backgroundColor: COLORS.card, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  documentText: { fontSize: 10, color: COLORS.textPrimary },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: RADIUS.md },
  actionText: { color: '#fff', fontSize: 12, marginLeft: 4, fontWeight: '500' },
});