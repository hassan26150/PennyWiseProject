import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import * as adminApi from '../../api/admin.api';

interface DisputeResolutionProps {
  onNavigate: (screen: string) => void;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'open':
      return { backgroundColor: COLORS.errorTint, color: COLORS.error };
    case 'under_review':
      return { backgroundColor: '#FEF3C7', color: '#B45309' };
    case 'resolved':
      return { backgroundColor: COLORS.successTint, color: COLORS.success };
    default:
      return { backgroundColor: COLORS.primaryTint, color: COLORS.textSecondary };
  }
};

export default function DisputeResolution({ onNavigate }: DisputeResolutionProps) {
  const [disputes, setDisputes] = useState<any[]>([]);

  const fetchDisputes = async () => {
    try {
      const res = await adminApi.getDisputes();
      setDisputes(res.data);
    } catch (e) {
      console.log('Error fetching disputes:', e);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (dispute: any, resolution: string) => {
    try {
      await adminApi.resolveDispute(dispute._id, resolution, `Resolved in favor of ${resolution}`);
      Alert.alert('Resolved', `Dispute ${dispute._id} resolved in favor of ${resolution}.`);
      fetchDisputes();
    } catch (e) {
      Alert.alert('Error', 'Failed to resolve dispute');
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Resolution</Text>
        <View style={styles.disputeCount}>
          <Text style={styles.disputeCountText}>{disputes.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.listContainer}>
        {disputes.map((dispute) => {
          const statusStyle = getStatusStyle(dispute.status);
          return (
            <View key={dispute._id} style={styles.disputeCard}>
              {/* Header */}
              <View style={styles.disputeHeader}>
                <View style={styles.disputeHeaderLeft}>
                  <Feather name="alert-triangle" size={20} color={COLORS.error} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.disputeId}>{dispute._id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.disputeDate}>{new Date(dispute.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Text style={{ color: statusStyle.color, fontSize: 12 }}>
                    {dispute.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Parties */}
              <View style={styles.parties}>
                <View style={[styles.partyCard, { backgroundColor: COLORS.secondaryTint }]}>
                  <View style={styles.partyIcon}>
                    <Ionicons name="person" size={20} color={COLORS.secondary} />
                  </View>
                  <View>
                    <Text style={styles.partyLabel}>Buyer</Text>
                    <Text style={styles.partyName}>{dispute.buyer_id?.name || 'Unknown'}</Text>
                  </View>
                </View>
                <View style={[styles.partyCard, { backgroundColor: COLORS.primaryTint }]}>
                  <View style={styles.partyIcon}>
                    <MaterialCommunityIcons name="store" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.partyLabel}>Seller</Text>
                    <Text style={styles.partyName}>{dispute.seller_id?.name || 'Unknown'}</Text>
                  </View>
                </View>
              </View>

              {/* Details */}
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Order ID</Text>
                    <Text style={styles.detailText}>{dispute.order_id}</Text>
                  </View>
                </View>
                <View style={{ marginBottom: 4 }}>
                  <Text style={styles.detailLabel}>Issue</Text>
                  <Text style={styles.detailText}>{dispute.issue_type}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailText}>{dispute.description}</Text>
                </View>
              </View>

              {/* Actions */}
              {dispute.status !== 'resolved' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => Alert.alert('Conversation', `Viewing conversation for dispute ${dispute._id}. Full messaging will be available after backend integration.`)}
                  >
                    <MaterialCommunityIcons name="message-text-outline" size={16} color="#fff" />
                    <Text style={styles.viewButtonText}>View Conversation</Text>
                  </TouchableOpacity>
                  <View style={styles.resolveButtons}>
                    <TouchableOpacity
                      style={[styles.resolveButton, { backgroundColor: COLORS.primary }]}
                      onPress={() => handleResolve(dispute, 'Buyer')}
                    >
                      <Text style={styles.resolveButtonText}>Resolve in Buyer's Favor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.resolveButton, { backgroundColor: COLORS.secondary }]}
                      onPress={() => handleResolve(dispute, 'Seller')}
                    >
                      <Text style={styles.resolveButtonText}>Resolve in Seller's Favor</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.card },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: COLORS.primary },
  disputeCount: { marginLeft: 'auto', backgroundColor: COLORS.error, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.md },
  disputeCountText: { color: '#fff', fontSize: 12 },
  listContainer: { flex: 1, padding: 12, backgroundColor: COLORS.background },
  disputeCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 12, marginBottom: 12, ...SHADOWS.sm },
  disputeHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: COLORS.border, paddingBottom: 8, marginBottom: 8 },
  disputeHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  disputeId: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  disputeDate: { fontSize: 12, color: COLORS.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.md },
  parties: { marginBottom: 8 },
  partyCard: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: RADIUS.md, marginBottom: 4 },
  partyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  partyLabel: { fontSize: 10, color: COLORS.textSecondary },
  partyName: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  detailsCard: { backgroundColor: COLORS.primaryTint, borderRadius: RADIUS.md, padding: 8, marginBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detailCol: { width: '48%' },
  detailLabel: { fontSize: 10, color: COLORS.textSecondary, marginBottom: 2 },
  detailText: { fontSize: 12, color: COLORS.textPrimary },
  amount: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },
  actions: { marginTop: 8 },
  viewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, padding: 8, borderRadius: RADIUS.sm, marginBottom: 4 },
  viewButtonText: { color: '#fff', fontSize: 12, marginLeft: 4 },
  resolveButtons: { flexDirection: 'row', gap: 4 },
  resolveButton: { flex: 1, padding: 8, borderRadius: RADIUS.sm },
  resolveButtonText: { color: '#fff', fontSize: 12, textAlign: 'center' },
});