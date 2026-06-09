import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import usePriceAlertStore from '../../store/priceAlertStore';

interface PriceAlertsProps {
  onNavigate: (screen: string) => void;
  onSelectProduct: (product: any) => void;
}

export default function PriceAlerts({ onNavigate, onSelectProduct }: PriceAlertsProps) {
  const { alerts, fetchAlerts, deleteAlert, isLoading } = usePriceAlertStore();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Remove Alert', 'Are you sure you want to remove this price alert?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteAlert(id) }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const p = item.product_id;
    return (
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardContent} onPress={() => onSelectProduct(p)}>
          {p.thumbnail ? (
            <Image source={{ uri: p.thumbnail }} style={styles.image} />
          ) : (
            <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
              <Feather name="image" size={24} color="#D1D5DB" />
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
            <View style={styles.targetPriceContainer}>
              <Text style={styles.targetLabel}>Target Price:</Text>
              <Text style={styles.targetPrice}>PKR {item.target_price.toLocaleString()}</Text>
            </View>
            <Text style={[styles.status, item.active ? styles.statusActive : styles.statusMet]}>
              {item.active ? 'Active' : 'Alert Met'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
          <Feather name="trash-2" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Alerts</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>No active price alerts.</Text>
          <Text style={styles.emptySubtext}>Set alerts on products to be notified when prices drop.</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#005461', padding: 16 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  list: { padding: 16 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  image: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F3F4F6' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  targetPriceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  targetLabel: { fontSize: 12, color: '#6B7280', marginRight: 4 },
  targetPrice: { fontSize: 14, fontWeight: 'bold', color: '#10B981' },
  status: { fontSize: 10, fontWeight: 'bold', overflow: 'hidden', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  statusActive: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  statusMet: { backgroundColor: '#D1FAE5', color: '#065F46' },
  deleteButton: { padding: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#4B5563', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
});
