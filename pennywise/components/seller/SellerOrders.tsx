// SellerOrders.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import useOrderStore from '../../store/orderStore';

interface SellerOrdersProps {
  onNavigate: (screen: string) => void;
}

export default function SellerOrders({ onNavigate }: SellerOrdersProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'shipped'>('pending');
  const { sellerOrders, fetchSellerOrders, confirmOrder, processOrder, shipOrder, deliverOrder, cancelSellerOrder, isLoading } = useOrderStore();

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Feather name="clock" size={20} color={COLORS.secondary} />;
      case 'confirmed': return <Feather name="check-circle" size={20} color={COLORS.accent} />;
      case 'processing': return <Feather name="settings" size={20} color={COLORS.accent} />;
      case 'shipped': return <MaterialCommunityIcons name="package-variant" size={20} color={COLORS.primary} />;
      case 'delivered': return <MaterialCommunityIcons name="check-all" size={20} color={COLORS.primary} />;
      default: return <Feather name="package" size={20} color={COLORS.secondary} />;
    }
  };

  const currentOrders = sellerOrders.filter(o => 
    activeTab === 'pending' ? o.status === 'pending' :
    activeTab === 'confirmed' ? (o.status === 'confirmed' || o.status === 'processing') :
    o.status === 'shipped' || o.status === 'delivered'
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={{ padding: 4 }}>
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orders Management</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'pending' ? styles.tabActive : styles.tabInactive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={activeTab === 'pending' ? styles.tabTextActive : styles.tabTextInactive}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'confirmed' ? styles.tabActive : styles.tabInactive]}
            onPress={() => setActiveTab('confirmed')}
          >
            <Text style={activeTab === 'confirmed' ? styles.tabTextActive : styles.tabTextInactive}>
              Confirmed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'shipped' ? styles.tabActive : styles.tabInactive]}
            onPress={() => setActiveTab('shipped')}
          >
            <Text style={activeTab === 'shipped' ? styles.tabTextActive : styles.tabTextInactive}>
              Shipped
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : currentOrders.length === 0 ? (
          <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: COLORS.textSecondary }}>No {activeTab} orders found.</Text>
          </View>
        ) : currentOrders.map((order) => (
          <View key={order._id} style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {getStatusIcon(order.status)}
                <Text style={styles.orderId}>{order._id.slice(-6).toUpperCase()}</Text>
                <View style={{ backgroundColor: COLORS.primaryTint, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                   <Text style={{ fontSize: 10, color: COLORS.primary }}>{order.status}</Text>
                </View>
              </View>
              <Text style={styles.orderTime}>{new Date(order.created_at).toLocaleString()}</Text>
            </View>

            {/* Order Details */}
            <View style={{ marginTop: 8, marginBottom: 12 }}>
              <Text style={styles.label}>Customer</Text>
              <Text style={styles.value}>{order.buyer_id?.name || 'Customer'}</Text>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{order.shipping_address?.address}, {order.shipping_address?.city}</Text>
              <Text style={styles.label}>Products</Text>
              <Text style={styles.value}>{order.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}</Text>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.amount}>PKR {order.total_amount.toLocaleString()}</Text>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {activeTab === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                    onPress={() => {
                      Alert.alert('Confirm Order', 'Proceed to confirm?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Yes', onPress: () => confirmOrder(order._id) }
                      ]);
                    }}
                  >
                    <Feather name="check-circle" size={14} color="white" />
                    <Text style={styles.actionText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                    onPress={() => {
                      Alert.alert('Cancel Order', 'Cancel this order? This will restore stock.', [
                        { text: 'No', style: 'cancel' },
                        { text: 'Yes, Cancel', onPress: () => cancelSellerOrder(order._id) }
                      ]);
                    }}
                  >
                    <Feather name="x-circle" size={14} color="white" />
                    <Text style={styles.actionText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
              {activeTab === 'confirmed' && order.status === 'confirmed' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.accent }]}
                  onPress={() => processOrder(order._id)}
                >
                  <Feather name="settings" size={14} color="white" />
                  <Text style={styles.actionText}>Start Processing</Text>
                </TouchableOpacity>
              )}
              {activeTab === 'confirmed' && order.status === 'processing' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
                  onPress={() => {
                    Alert.prompt(
                      "Enter Tracking Number",
                      "Provide tracking details for the shipment:",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Ship", onPress: (trackingNumber) => shipOrder(order._id, trackingNumber || 'N/A') }
                      ],
                      "plain-text"
                    );
                  }}
                >
                  <MaterialCommunityIcons name="package-variant" size={14} color="white" />
                  <Text style={styles.actionText}>Mark as Shipped</Text>
                </TouchableOpacity>
              )}
              {activeTab === 'shipped' && order.status === 'shipped' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                  onPress={() => deliverOrder(order._id)}
                >
                  <MaterialCommunityIcons name="check-all" size={14} color="white" />
                  <Text style={styles.actionText}>Mark Delivered</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary, marginLeft: 8 },

  tabs: { flexDirection: 'row', gap: 8 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.sm, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary },
  tabInactive: { backgroundColor: COLORS.primaryTint },
  tabTextActive: { color: 'white', fontSize: 12, fontWeight: '600' },
  tabTextInactive: { color: COLORS.primary, fontSize: 12 },

  orderCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary },
  orderTime: { fontSize: 12, color: COLORS.textSecondary },

  label: { fontSize: 10, color: COLORS.secondary, marginTop: 4 },
  value: { fontSize: 12, color: COLORS.textPrimary, marginBottom: 4 },
  amount: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 },

  actionButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: RADIUS.sm, gap: 4 },
  actionText: { color: 'white', fontSize: 12 },
});
