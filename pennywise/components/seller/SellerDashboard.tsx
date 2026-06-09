// SellerDashboard.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import useAnalyticsStore from '../../store/analyticsStore';
import useAuthStore from '../../store/authStore';
import useOrderStore from '../../store/orderStore';

interface SellerDashboardProps {
  onNavigate: (screen: string) => void;
}

// Dummy data removed, now using real data from useOrderStore

export default function SellerDashboard({ onNavigate }: SellerDashboardProps) {
  const [currentView, setCurrentView] = useState<'main' | 'analytics'>('main');
  const { fetchSellerAnalytics, sellerOverview, sellerTopProducts, sellerRevenue, sellerDiscovery, isLoading } = useAnalyticsStore();
  const { user } = useAuthStore();
  const { sellerOrders, fetchSellerOrders } = useOrderStore();

  React.useEffect(() => {
    fetchSellerAnalytics();
    fetchSellerOrders('pending');
  }, []);

  if (currentView === 'analytics') {
    return (
      <AnalyticsScreen 
        onBack={() => setCurrentView('main')} 
        overview={sellerOverview} 
        topProducts={sellerTopProducts} 
        revenue={sellerRevenue} 
        discovery={sellerDiscovery}
      />
    );
  }

  const stats = [
    { label: 'Total Sales', value: `PKR ${(sellerOverview?.total_sales || 0).toLocaleString()}`, change: 'Current', icon: FontAwesome5, iconName: 'chart-line', color: ['#005461', '#018790'] },
    { label: 'Orders', value: `${sellerOverview?.total_orders || 0}`, change: 'Current', icon: Feather, iconName: 'shopping-cart', color: ['#00B7B5', '#10B981'] },
    { label: 'Customers', value: `${sellerOverview?.total_customers || 0}`, change: 'Unique', icon: Feather, iconName: 'users', color: ['#10B981', '#34D399'] },
    { label: 'Fulfillment', value: `${(sellerOverview?.fulfillment_rate || 0).toFixed(1)}%`, change: 'Rate', icon: MaterialCommunityIcons, iconName: 'check-decagram', color: ['#018790', '#00B7B5'] },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back, {user?.profile?.store_name || user?.name || 'Seller'}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon as any;
          return (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color[0] }]}>
                <IconComponent name={stat.iconName} size={20} color="white" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statChange}>{stat.change}</Text>
            </View>
          );
        })}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#005461' }]} onPress={() => onNavigate('add-product')}>
            <Feather name="plus" size={24} color="white" />
            <Text style={styles.actionText}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#018790' }]} onPress={() => setCurrentView('analytics')}>
            <FontAwesome5 name="chart-bar" size={24} color="white" />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#00B7B5' }]} onPress={() => onNavigate('products')}>
            <MaterialCommunityIcons name="package-variant" size={24} color="white" />
            <Text style={styles.actionText}>My Products</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10B981' }]} onPress={() => onNavigate('orders')}>
            <Feather name="shopping-cart" size={24} color="white" />
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Orders</Text>
          <TouchableOpacity onPress={() => onNavigate('orders')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>
        {sellerOrders.length === 0 ? (
          <Text style={{ textAlign: 'center', color: COLORS.textSecondary, padding: 20 }}>No pending orders.</Text>
        ) : (
          sellerOrders.map((order: any) => (
            <View key={order._id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{`ORD-${order._id.substring(order._id.length - 6).toUpperCase()}`}</Text>
                <Text style={styles.orderTime}>{new Date(order.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.orderCustomer}>{order.buyer_id?.name || 'Unknown Customer'}</Text>
              <Text style={styles.orderProduct}>
                {order.items?.length > 0 ? order.items[0].product_name : 'No items'}
                {order.items?.length > 1 ? ` (+${order.items.length - 1} more)` : ''}
              </Text>
              <Text style={styles.orderAmount}>PKR {order.total_amount?.toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// Analytics Screen
function AnalyticsScreen({ onBack, overview, topProducts, revenue, discovery }: any) {
  
  // Transform revenue for chart (max height is 100)
  const maxRevenue = Math.max(...(revenue || []).map((r: any) => r.revenue), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={onBack}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        {/* Revenue Chart */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Monthly Revenue</Text>
          {revenue && revenue.map((item: any, index: number) => {
            const percent = (item.revenue / maxRevenue) * 100;
            return (
              <View key={index} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.revenueMonth}>{item.period}</Text>
                  <Text style={styles.revenueAmount}>PKR {item.revenue.toLocaleString()}</Text>
                </View>
                <View style={styles.revenueBarBg}>
                  <View style={[styles.revenueBarFg, { width: `${percent}%` }]} />
                </View>
              </View>
            );
          })}
          {(!revenue || revenue.length === 0) && <Text style={{ color: '#666', fontStyle: 'italic' }}>No revenue data yet.</Text>}
        </View>

        {/* Top Products */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Top Performing Products</Text>
          {topProducts && topProducts.map((item: any, index: number) => (
            <View key={index} style={styles.productRow}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#E0F2F1', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: '#005461', fontWeight: 'bold', fontSize: 12 }}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.product}</Text>
                <Text style={styles.productSales}>{item.sales_count} units sold</Text>
              </View>
              <Text style={styles.productAmount}>PKR {item.revenue.toLocaleString()}</Text>
            </View>
          ))}
          {(!topProducts || topProducts.length === 0) && <Text style={{ color: '#666', fontStyle: 'italic' }}>No products sold yet.</Text>}
        </View>

        {/* Discovery Analytics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Product Discovery (Marketplace)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <View style={{ width: '48%', marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Total Views</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#005461' }}>{discovery?.views || 0}</Text>
            </View>
            <View style={{ width: '48%', marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Impressions</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#005461' }}>{discovery?.impressions || 0}</Text>
            </View>
            <View style={{ width: '48%', marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Favorites</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#005461' }}>{discovery?.favorites || 0}</Text>
            </View>
            <View style={{ width: '48%', marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>Price Alerts Set</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#005461' }}>{discovery?.alerts || 0}</Text>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          <View style={[styles.metricCard, { backgroundColor: 'rgba(0,84,97,0.1)' }]}>
            <Text style={[styles.metricValue, { color: '#005461' }]}>4.8</Text>
            <Text style={styles.metricLabel}>Avg Rating</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: 'rgba(0,183,181,0.1)' }]}>
            <Text style={[styles.metricValue, { color: '#00B7B5' }]}>94%</Text>
            <Text style={styles.metricLabel}>Order Fulfillment</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: 16, marginBottom: 16, borderRadius: RADIUS.md },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: 'white', fontSize: 14, marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  statCard: { backgroundColor: 'white', borderRadius: 12, padding: 12, width: '48%', marginBottom: 12 },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statChange: { fontSize: 12, color: '#10B981' },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: { width: '48%', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  actionText: { color: 'white', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  viewAll: { fontSize: 12, color: '#005461' },

  orderCard: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 8 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderId: { fontSize: 12, color: 'white', backgroundColor: '#005461', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  orderTime: { fontSize: 10, color: '#6B7280' },
  orderCustomer: { fontSize: 14, fontWeight: 'bold' },
  orderProduct: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  orderAmount: { fontSize: 14, color: '#005461', fontWeight: 'bold' },

  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 16 },
  revenueMonth: { fontSize: 12, color: '#6B7280' },
  revenueAmount: { fontSize: 12, color: '#005461', fontWeight: 'bold' },
  revenueBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 },
  revenueBarFg: { height: 8, backgroundColor: '#005461', borderRadius: 4 },

  topProduct: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  topProductName: { fontSize: 14 },
  topProductSales: { fontSize: 12, color: '#6B7280' },
  topProductAmount: { fontSize: 14, color: '#005461', fontWeight: 'bold' },

  metricCard: { flex: 0.48, borderRadius: 12, padding: 12, alignItems: 'center' },
  metricValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  metricLabel: { fontSize: 12, color: '#6B7280' },
});
