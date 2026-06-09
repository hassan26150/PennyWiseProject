import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../theme';

interface UserManagementProps {
  onNavigate: (screen: string) => void;
}

import * as adminApi from '../../api/admin.api';

export default function UserManagement({ onNavigate }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buyer' | 'seller'>('all');
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers({ search: searchQuery, role: filterType === 'all' ? '' : filterType });
      setUsers(res.data);
    } catch (e) {
      console.log('Error fetching users:', e);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [searchQuery, filterType]);

  const handleStatusChange = async (user: any, newStatus: string) => {
    const reason = newStatus === 'suspended' ? 'Violation of terms' : newStatus === 'deactivated' ? 'Removed by admin' : 'Reactivated by admin';
    
    try {
      await adminApi.updateUserStatus(user._id, newStatus, reason);
      Alert.alert('Success', `User ${user.name} is now ${newStatus}`);
      fetchUsers();
    } catch (e) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => onNavigate('home')}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Management</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={COLORS.textMuted} style={{ position: 'absolute', left: 10, top: 10 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search users..."
            style={styles.searchInput}
          />
        </View>

        {/* Filter */}
        <View style={styles.filterContainer}>
          {(['all', 'buyer', 'seller'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilterType(type)}
              style={[
                styles.filterButton,
                filterType === type ? styles.filterActive : styles.filterInactive,
              ]}
            >
              <Text style={filterType === type ? styles.filterTextActive : styles.filterTextInactive}>
                {type.charAt(0).toUpperCase() + type.slice(1)} (
                {type === 'all'
                  ? users.length
                  : users.filter(u => u.role === type).length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Users List */}
      <ScrollView style={styles.listContainer}>
        {users.map((user) => (
          <View key={user._id} style={styles.userCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={[styles.userIcon, { backgroundColor: user.role === 'buyer' ? COLORS.secondaryTint : COLORS.primaryTint }]}>
                {user.role === 'buyer' ? (
                  <Feather name="user" size={24} color={COLORS.secondary} />
                ) : (
                  <MaterialCommunityIcons name="store" size={24} color={COLORS.primary} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <View>
                    <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
                    <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Options', `More options for ${user.name}`)}>
                    <Feather name="more-vertical" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                  <View style={[styles.badge, user.status === 'active' ? styles.badgeActive : styles.badgeSuspended]}>
                    <Text style={[styles.badgeText, { color: user.status === 'active' ? COLORS.success : COLORS.error }]}>{user.status}</Text>
                  </View>
                  <View style={[styles.badge, user.role === 'buyer' ? styles.badgeBuyer : styles.badgeSeller]}>
                    <Text style={[styles.badgeText, { color: user.role === 'buyer' ? COLORS.secondary : COLORS.primary }]}>{user.role}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View>
                    <Text style={styles.infoLabel}>Joined</Text>
                    <Text style={styles.infoValue}>{new Date(user.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <TouchableOpacity
                    style={[styles.actionButton, user.status === 'active' ? styles.suspendButton : styles.activateButton]}
                    onPress={() => Alert.alert(
                      user.status === 'active' ? 'Suspend User' : 'Activate User',
                      `Are you sure you want to ${user.status === 'active' ? 'suspend' : 'activate'} ${user.name}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Yes', onPress: () => handleStatusChange(user, user.status === 'active' ? 'suspended' : 'active') }
                      ]
                    )}
                  >
                    <Text style={[styles.actionText, { color: user.status === 'active' ? COLORS.error : COLORS.success }]}>
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                  
                  {user.status !== 'deactivated' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: COLORS.errorTint }]}
                      onPress={() => Alert.alert(
                        'Remove User',
                        `Are you sure you want to permanently remove (deactivate) ${user.name}?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Yes, Remove', style: 'destructive', onPress: () => handleStatusChange(user, 'deactivated') }
                        ]
                      )}
                    >
                      <Text style={[styles.actionText, { color: COLORS.error }]}>Remove</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, styles.detailsButton]}
                    onPress={() => Alert.alert('User Details', `Name: ${user.name}\nEmail: ${user.email}\nType: ${user.role}\nStatus: ${user.status}`)}
                  >
                    <Text style={[styles.actionText, styles.detailsText]}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.card },
  header: { padding: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 8, color: COLORS.primary },
  searchContainer: { position: 'relative', marginBottom: 12 },
  searchInput: { paddingLeft: 36, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm },
  filterContainer: { flexDirection: 'row', gap: 8 },
  filterButton: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm, alignItems: 'center' },
  filterActive: { backgroundColor: COLORS.primary },
  filterInactive: { backgroundColor: COLORS.primaryTint },
  filterTextActive: { color: '#fff', fontSize: 12, fontWeight: '600' },
  filterTextInactive: { color: COLORS.primary, fontSize: 12 },
  listContainer: { flex: 1, padding: 12, backgroundColor: COLORS.background },
  userCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 12, marginBottom: 12, ...SHADOWS.sm },
  userIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  userEmail: { fontSize: 12, color: COLORS.textSecondary },
  badge: { borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeActive: { backgroundColor: COLORS.successTint },
  badgeSuspended: { backgroundColor: COLORS.errorTint },
  badgeBuyer: { backgroundColor: COLORS.secondaryTint },
  badgeSeller: { backgroundColor: COLORS.primaryTint },
  infoLabel: { fontSize: 10, color: COLORS.textSecondary },
  infoValue: { fontSize: 12, fontWeight: '500', color: COLORS.textPrimary },
  actionButton: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.sm, alignItems: 'center' },
  suspendButton: { backgroundColor: COLORS.errorTint },
  activateButton: { backgroundColor: COLORS.successTint },
  detailsButton: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  actionText: { fontSize: 12, fontWeight: '500' },
  detailsText: { color: COLORS.textSecondary },
});