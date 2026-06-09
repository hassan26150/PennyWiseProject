import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Switch } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { COLORS, RADIUS, SHADOWS } from '../../theme';

interface BuyerProfileProps {
  onLogout: () => void;
  onNavigate?: (screen: string) => void;
}

type ViewType = 'main' | 'account' | 'settings' | 'notifications' | 'help' | 'edit';

export default function BuyerProfile({ onLogout }: BuyerProfileProps) {
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const { user } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
  };

  if (currentView === 'account') return <AccountInfo onBack={() => setCurrentView('main')} />;
  if (currentView === 'settings') return <SettingsScreen onBack={() => setCurrentView('main')} />;
  if (currentView === 'notifications') return <NotificationsScreen onBack={() => setCurrentView('main')} />;
  if (currentView === 'help') return <HelpSupportScreen onBack={() => setCurrentView('main')} />;
  if (currentView === 'edit') return <EditProfileScreen onBack={() => setCurrentView('main')} />;

  const menuItems = [
    {
      title: 'Account Information',
      subtitle: 'View your account details',
      icon: 'user' as any,
      view: 'account' as const,
      gradient: ['#005461', '#018790'] as const,
    },
    {
      title: 'Settings',
      subtitle: 'App preferences and privacy',
      icon: 'settings' as any,
      view: 'settings' as const,
      gradient: ['#018790', '#00B7B5'] as const,
    },
    {
      title: 'Notifications',
      subtitle: 'Manage alerts and updates',
      icon: 'bell' as any,
      view: 'notifications' as const,
      gradient: ['#00B7B5', '#018790'] as const,
      badge: unreadCount > 0 ? unreadCount.toString() : undefined,
    },
    {
      title: 'Help & Support',
      subtitle: 'FAQs and customer service',
      icon: 'help-circle' as any,
      view: 'help' as const,
      gradient: ['#00B7B5', '#005461'] as const,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#005461', '#018790']} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.userIcon}>
            <Feather name="user" size={40} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || 'Guest'}</Text>
            <Text style={styles.email}>{user?.email || 'No email'}</Text>
          </View>
          <TouchableOpacity onPress={() => handleNavigate('edit')} style={styles.editButton}>
            <Feather name="edit" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={{ padding: 15 }}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.menuButton}
            onPress={() => handleNavigate(item.view)}
          >
            <View style={styles.menuLeft}>
              <LinearGradient colors={item.gradient} style={styles.menuIcon}>
                <Feather name={item.icon} size={20} color="white" />
              </LinearGradient>
              <View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>

            <View style={styles.menuRight}>
              {item.badge && (
                <View style={styles.menuBadge}>
                  <Text style={{ color: 'white', fontSize: 12 }}>{item.badge}</Text>
                </View>
              )}
              <Feather name="chevron-right" size={20} color="gray" />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Feather name="log-out" size={20} color="white" />
          <Text style={{ color: 'white', fontWeight: '500', marginLeft: 5 }}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray', fontSize: 12 }}>PennyWise v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

/* ---------------- SUBSCREENS ---------------- */

function AccountInfo({ onBack }: { onBack: () => void }) {
  const { user } = useAuthStore();
  
  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#005461', '#018790']} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Account Information</Text>
      </LinearGradient>
      
      <View style={{ padding: 20 }}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Full Name</Text>
          <Text style={styles.infoValue}>{user?.name}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email Address</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Account Role</Text>
          <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{user?.role}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Member Since</Text>
          <Text style={styles.infoValue}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#005461', '#018790']} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Settings</Text>
      </LinearGradient>
      
      <View style={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: COLORS.primary }} />
        </View>
        
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Push Notifications</Text>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: COLORS.primary }} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Email Alerts</Text>
          <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ true: COLORS.primary }} />
        </View>
      </View>
    </ScrollView>
  );
}

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const { notifications, fetchNotifications, markAllAsRead, isLoading } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#005461', '#018790']} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Notifications</Text>
        <View style={{ flex: 1 }} />
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
             <Text style={{ color: 'white', fontSize: 12 }}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
      
      <View style={{ padding: 15 }}>
        {isLoading && <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>}
        {!isLoading && notifications.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Feather name="bell-off" size={50} color="#ccc" />
            <Text style={{ color: 'gray', marginTop: 10 }}>No new notifications</Text>
          </View>
        )}
        
        {notifications.map((n: any) => (
          <View key={n._id} style={[styles.notifCard, !n.read && styles.notifCardUnread]}>
            <View style={[styles.notifIcon, !n.read && { backgroundColor: COLORS.primary }]}>
              <Feather name="info" size={16} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.notifTitle, !n.read && { fontWeight: 'bold' }]}>{n.title}</Text>
              <Text style={styles.notifBody}>{n.message}</Text>
              <Text style={styles.notifTime}>{new Date(n.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function HelpSupportScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#005461', '#018790']} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Help & Support</Text>
      </LinearGradient>
      
      <View style={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqCard}>
          <Text style={styles.faqQ}>How do I track my order?</Text>
          <Text style={styles.faqA}>You can track your order in the "Orders" tab at the bottom of your screen.</Text>
        </View>
        
        <View style={styles.faqCard}>
          <Text style={styles.faqQ}>What is PennyWise's return policy?</Text>
          <Text style={styles.faqA}>Returns are accepted within 7 days of delivery for defective items.</Text>
        </View>

        <View style={styles.faqCard}>
          <Text style={styles.faqQ}>How do price drops work?</Text>
          <Text style={styles.faqA}>We monitor prices continuously. Set an alert on a product and we'll notify you when the price drops!</Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Contact Us</Text>
        <View style={styles.contactCard}>
          <Feather name="mail" size={20} color={COLORS.primary} />
          <Text style={{ marginLeft: 10 }}>support@pennywise.com</Text>
        </View>
        <View style={styles.contactCard}>
          <Feather name="phone" size={20} color={COLORS.primary} />
          <Text style={{ marginLeft: 10 }}>1-800-PENNYWISE</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }
    setIsSaving(true);
    const res = await updateUser({ name, email });
    setIsSaving(false);
    
    if (res.success) {
      Alert.alert('Success', 'Profile updated successfully');
      onBack();
    } else {
      Alert.alert('Error', res.message || 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#005461', '#018790']} style={styles.subHeader}>
        <TouchableOpacity onPress={onBack}>
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Edit Profile</Text>
      </LinearGradient>
      
      <View style={{ padding: 20 }}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="Enter your name" 
        />
        
        <Text style={styles.label}>Email Address</Text>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          placeholder="Enter your email" 
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfd' },
  header: { padding: 15, paddingTop: 40, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userIcon: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50, padding: 12, marginRight: 15 },
  name: { fontSize: 20, fontWeight: '700', color: 'white' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  editButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  menuIcon: { padding: 10, borderRadius: 12 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  menuSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  menuBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.lg,
    marginTop: 20,
    ...SHADOWS.md,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  subHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginLeft: 15,
  },
  // Account Info
  infoCard: { backgroundColor: 'white', padding: 15, borderRadius: RADIUS.md, marginBottom: 10, ...SHADOWS.sm },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  infoValue: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '500' },
  // Edit Profile
  label: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 15, marginBottom: 20, fontSize: 16 },
  saveButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  // Settings
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 15 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: RADIUS.md, marginBottom: 10, ...SHADOWS.sm },
  settingText: { fontSize: 16, color: COLORS.textPrimary },
  // Notifications
  notifCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: RADIUS.md, marginBottom: 10, ...SHADOWS.sm },
  notifCardUnread: { backgroundColor: '#f0fdfd', borderColor: COLORS.primaryTint, borderWidth: 1 },
  notifIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  notifTitle: { fontSize: 14, color: COLORS.textPrimary, marginBottom: 4 },
  notifBody: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  notifTime: { fontSize: 11, color: '#999' },
  // Help
  faqCard: { backgroundColor: 'white', padding: 15, borderRadius: RADIUS.md, marginBottom: 10, ...SHADOWS.sm },
  faqQ: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 5 },
  faqA: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: RADIUS.md, marginBottom: 10, ...SHADOWS.sm },
});
