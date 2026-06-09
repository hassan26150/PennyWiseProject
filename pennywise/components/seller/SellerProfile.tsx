import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import useAuthStore from '../../store/authStore';
import useAnalyticsStore from '../../store/analyticsStore';

interface SellerProfileProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
}

export default function SellerProfile({ onLogout, onNavigate }: SellerProfileProps) {
  const { user, updateUser } = useAuthStore();
  const { fetchSellerAnalytics, sellerOverview } = useAnalyticsStore();
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  // Edit form state
  const [storeName, setStoreName] = useState(user?.profile?.store_name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [businessAddress, setBusinessAddress] = useState(user?.profile?.store_location || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSellerAnalytics();
  }, []);

  const handleSaveStoreInfo = async () => {
    if (!storeName || !contactEmail) {
      Alert.alert('Error', 'Store name and contact email are required.');
      return;
    }
    
    setIsSaving(true);
    const res = await updateUser({
      email: contactEmail,
      phone: phoneNumber,
      profile: {
        store_name: storeName,
        store_location: businessAddress
      }
    });
    setIsSaving(false);

    if (res.success) {
      Alert.alert('Success', 'Store information updated successfully');
      setEditModalVisible(false);
    } else {
      Alert.alert('Error', res.message || 'Failed to update store info');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradientPrimary} style={styles.header}>
        <Text style={styles.headerTitle}>Seller Profile</Text>
        <Text style={styles.headerSubtitle}>
          Manage your store information
        </Text>
      </LinearGradient>

      {/* Store Card */}
      <View style={styles.card}>
        <View style={styles.storeRow}>
          <LinearGradient
            colors={COLORS.gradientPrimary}
            style={styles.storeIcon}
          >
            <FontAwesome5 name="store" size={28} color="#fff" />
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{user?.profile?.store_name || 'My Store'}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={COLORS.star} />
              <Text style={styles.ratingText}> {sellerOverview?.rating || '0.0'} ({sellerOverview?.total_orders || 0} sales)</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <FontAwesome5 name="dollar-sign" size={18} color={COLORS.accent} />
            <Text style={styles.statLabel}>Sales (PKR)</Text>
            <Text style={styles.statValue}>{(sellerOverview?.total_sales || 0).toLocaleString()}</Text>
          </View>

          <View style={styles.statBox}>
            <Feather name="shopping-cart" size={18} color={COLORS.primary} />
            <Text style={styles.statLabel}>Orders</Text>
            <Text style={styles.statValue}>{sellerOverview?.total_orders || 0}</Text>
          </View>

          <View style={styles.statBox}>
            <Feather name="users" size={18} color={COLORS.star} />
            <Text style={styles.statLabel}>Customers</Text>
            <Text style={styles.statValue}>{sellerOverview?.total_customers || 0}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.editButtonText}>Edit Store Info</Text>
        </TouchableOpacity>
      </View>

      {/* Store Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Store Information</Text>

        {infoItem("mail-outline", "Email", user?.email || "Not set")}
        {infoItem("call-outline", "Phone", user?.phone || "Not set")}
        {infoItem(
          "location-outline",
          "Store Location",
          user?.profile?.store_location || "Not set"
        )}

        <View style={styles.infoRow}>
          <Ionicons name="storefront-outline" size={20} color={COLORS.textSecondary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.infoLabel}>Store Status</Text>
            <View style={[styles.activeBadge, user?.status === 'pending' && { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.activeText}>{user?.status === 'pending' ? 'Pending Approval' : 'Active & Verified'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Settings Menu */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => onNavigate && onNavigate('products')}
        >
          <MaterialIcons name="inventory" size={20} color={COLORS.secondary} />
          <Text style={styles.menuText}>Inventory Management</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => Alert.alert('Payment Settings', 'Add your bank account details here to receive payouts.')}
        >
          <MaterialIcons name="credit-card" size={20} color={COLORS.secondary} />
          <Text style={styles.menuText}>Payment Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => Alert.alert('Reviews & Ratings', `You have an average rating of ${sellerOverview?.rating || '0.0'} based on your orders.`)}
        >
          <MaterialIcons name="star-outline" size={20} color={COLORS.secondary} />
          <Text style={styles.menuText}>Reviews & Ratings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}> Logout</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>PennyWise Seller v1.0.0</Text>

      {/* Edit Store Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Store Info</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.label}>Store Name</Text>
              <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} placeholder="Your Store Name" />

              <Text style={styles.label}>Contact Email</Text>
              <TextInput style={styles.input} value={contactEmail} onChangeText={setContactEmail} placeholder="Business Email" keyboardType="email-address" />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="+92 300 0000000" keyboardType="phone-pad" />

              <Text style={styles.label}>Business Address</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={businessAddress} onChangeText={setBusinessAddress} placeholder="Full address" multiline />

              <TouchableOpacity 
                style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
                onPress={handleSaveStoreInfo}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function infoItem(icon: any, label: string, value: string) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={COLORS.textSecondary} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    paddingTop: 40,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.white,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  storeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.primaryTint,
    padding: 12,
    borderRadius: RADIUS.sm,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  editButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    alignItems: "center",
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  activeText: {
    color: "#fff",
    fontSize: 12,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 30,
  },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 15, marginBottom: 20, fontSize: 16 },
  saveButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: 10, marginBottom: 20 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});