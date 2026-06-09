import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import useProductStore from '../../store/productStore';
import useAnalyticsStore from '../../store/analyticsStore';
import * as adminApi from '../../api/admin.api';

import useAuthStore from '../../store/authStore';

interface AdminDashboardProps {
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const { user } = useAuthStore();
  const { pendingProducts, fetchPendingProducts } = useProductStore();
  const { fetchAdminAnalytics, adminOverview, adminUserActivity, generateReport } = useAnalyticsStore();
  const [scrapers, setScrapers] = React.useState<any[]>([]);

  useEffect(() => {
    fetchPendingProducts();
    fetchAdminAnalytics();
    fetchScrapers();
  }, []);

  const fetchScrapers = async () => {
    if (!user) return;
    try {
      const res = await adminApi.getScraperStatus();
      setScrapers(res.data);
    } catch (e) {
      console.log('Failed to fetch scraper status', e);
    }
  };

  const handleGenerateReport = async (type: string, format: string) => {
    try {
      const res = await generateReport(type, format);
      Alert.alert('Report Generated', `Report URL: ${res.data.file_url}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const maxActivity = Math.max(...(adminUserActivity || []).map((a: any) => a.buyer_count + a.seller_count), 1);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.name || 'Admin'}</Text>
        <Text style={styles.subtitle}>{user?.email || 'Platform overview and management'}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.cardBadge}>Active</Text>
          </View>
          <Text style={styles.cardLabel}>Total Users</Text>
          <Text style={styles.cardValue}>{adminOverview?.total_users || 0}</Text>
        </View>

        <View style={styles.card}>
          <MaterialCommunityIcons name="store-outline" size={24} color={COLORS.secondary} />
          <Text style={styles.cardLabel}>Active Sellers</Text>
          <Text style={styles.cardValue}>{adminOverview?.active_sellers || 0}</Text>
        </View>

        <View style={styles.card}>
          <Feather name="alert-triangle" size={24} color={COLORS.secondary} />
          <Text style={styles.cardLabel}>Pending Sellers</Text>
          <Text style={styles.cardValue}>{adminOverview?.pending_sellers || 0}</Text>
        </View>

        <View style={styles.card}>
          <Feather name="package" size={24} color={COLORS.secondary} />
          <Text style={styles.cardLabel}>Total Products</Text>
          <Text style={styles.cardValue}>{adminOverview?.total_products || 0}</Text>
        </View>
      </View>

      {/* User Activity Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Feather name="trending-up" size={18} color={COLORS.secondary} />
          <Text style={styles.chartTitle}>User Activity (Last 7 Days)</Text>
        </View>
        {/* Simple bar chart visualization */}
        <View style={styles.chartPlaceholder}>
          {adminUserActivity && adminUserActivity.length > 0 ? adminUserActivity.map((day: any, index: number) => {
            const height = ((day.buyer_count + day.seller_count) / maxActivity) * 100;
            return (
              <View key={index} style={styles.chartBar}>
                <View style={[styles.barFill, { height: Math.max(height, 5) }]} />
                <Text style={styles.chartBarLabel}>{new Date(day.date).getDate()}</Text>
              </View>
            );
          }) : <Text style={{ color: '#666' }}>No activity data.</Text>}
        </View>
      </View>

      {/* Scraper Status */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Feather name="server" size={18} color={COLORS.secondary} />
          <Text style={styles.chartTitle}>Scraper Status</Text>
        </View>
        <View style={{ gap: 8 }}>
          {scrapers.map((scraper, index) => (
            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
              <Text style={{ fontWeight: '500' }}>{scraper.platform}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>Errors: {scraper.failures}</Text>
                <View style={[styles.cardBadge, { backgroundColor: scraper.status === 'Healthy' ? COLORS.successTint : COLORS.errorTint, color: scraper.status === 'Healthy' ? COLORS.success : COLORS.error }]}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{scraper.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.actionCard, styles.primaryCard]} onPress={() => onNavigate('seller-approval')}>
          <MaterialCommunityIcons name="store-outline" size={32} color="white" />
          <Text style={styles.actionLabel}>Pending Sellers</Text>
          <Text style={styles.actionValue}>{adminOverview?.pending_sellers || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, styles.secondaryCard]} onPress={() => onNavigate('disputes')}>
          <Feather name="alert-triangle" size={32} color="white" />
          <Text style={styles.actionLabel}>Active Disputes</Text>
          <Text style={styles.actionValue}>{adminOverview?.active_disputes || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, styles.whiteCard]} onPress={() => onNavigate('user-management')}>
          <Ionicons name="people-outline" size={32} color={COLORS.primary} />
          <Text style={[styles.actionLabel, { color: COLORS.textPrimary }]}>User Management</Text>
          <Text style={[styles.actionValue, { color: COLORS.primary }]}>Manage Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.whiteCard]}
          onPress={() => onNavigate('product-approval')}
        >
          <Feather name="package" size={32} color={COLORS.primary} />
          <Text style={[styles.actionLabel, { color: COLORS.textPrimary }]}>Pending Products</Text>
          <Text style={[styles.actionValue, { color: COLORS.primary }]}>{pendingProducts.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, styles.secondaryCard]} onPress={() => handleGenerateReport('platform_activity', 'pdf')}>
          <MaterialCommunityIcons name="file-pdf-box" size={32} color="white" />
          <Text style={styles.actionLabel}>Activity PDF</Text>
          <Text style={styles.actionValue}>Generate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionCard, styles.primaryCard]} onPress={() => handleGenerateReport('order_statistics', 'csv')}>
          <MaterialCommunityIcons name="file-delimited" size={32} color="white" />
          <Text style={styles.actionLabel}>Orders CSV</Text>
          <Text style={styles.actionValue}>Generate</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Feather name="log-out" size={20} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.background },
  header: { marginBottom: 16 },
  title: { fontSize: 28, color: COLORS.primary, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: COLORS.secondary },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  card: { width: '48%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, marginBottom: 12, ...SHADOWS.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  cardBadge: { fontSize: 12, color: COLORS.secondary, backgroundColor: COLORS.secondaryTint, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.md },
  cardLabel: { fontSize: 12, color: COLORS.secondary, marginBottom: 4 },
  cardValue: { fontSize: 20, color: COLORS.primary, fontWeight: 'bold' },
  chartContainer: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, marginBottom: 16, ...SHADOWS.sm },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
  chartTitle: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14, marginLeft: 4 },
  chartPlaceholder: { height: 140, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', backgroundColor: COLORS.primaryTint, borderRadius: RADIUS.md, padding: 12 },
  chartBar: { alignItems: 'center', flex: 1 },
  barFill: { width: 20, backgroundColor: COLORS.primary, borderRadius: 4, marginBottom: 4 },
  chartBarLabel: { fontSize: 10, color: COLORS.textSecondary },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  actionCard: { width: '48%', borderRadius: RADIUS.lg, padding: 16, marginBottom: 12 },
  primaryCard: { backgroundColor: COLORS.primary },
  secondaryCard: { backgroundColor: COLORS.secondary },
  whiteCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  actionLabel: { fontSize: 14, color: 'white', marginTop: 8 },
  actionValue: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, padding: 12, borderRadius: RADIUS.lg, marginBottom: 24 },
  logoutText: { color: 'white', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
});
