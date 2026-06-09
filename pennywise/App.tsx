import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, StatusBar } from 'react-native';
import { COLORS, RADIUS } from './theme';

import AuthProvider from './context/AuthContext';
import useAuthStore from './store/authStore';

import BuyerHome from './components/buyer/BuyerHome';
import SearchResults from './components/buyer/SearchResults';
import ProductDetails from './components/buyer/ProductDetails';
import Cart from './components/buyer/Cart';
import Checkout from './components/buyer/Checkout';
import Orders from './components/buyer/Orders';
import Favorites from './components/buyer/Favorites';
import BuyerProfile from './components/buyer/BuyerProfile';
import ChatbotSearch from './components/buyer/ChatbotSearch';
import PriceAlerts from './components/buyer/PriceAlerts';
import { Toaster } from "./components/ui/sonner";
import SellerDashboard from './components/seller/SellerDashboard';
import SellerProducts from './components/seller/SellerProducts';
import AddProduct from './components/seller/AddProduct';
import SellerOrders from './components/seller/SellerOrders';
import SellerProfile from './components/seller/SellerProfile';

import AdminDashboard from './components/admin/AdminDashboard';
import SellerApproval from './components/admin/SellerApproval';
import UserManagement from './components/admin/UserManagement';
import DisputeResolution from './components/admin/DisputeResolution';
import ProductApproval from './components/admin/ProductApproval';
import AuthScreen from './components/AuthScreen';
import Notifications from './components/buyer/Notifications';

import useNotificationStore from './store/notificationStore';
import { io } from 'socket.io-client';
import * as NotificationsExpo from 'expo-notifications';
import Constants from 'expo-constants';
import * as api from './api/notification.api';

function AppContent() {
  const { isAuthenticated, role: userRole, logout, user } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { fetchUnreadCount, addLiveNotification, markAsRead } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();

      // 1. Socket.IO Connection
      const socket = io('http://localhost:5000', {
        auth: { token: useAuthStore.getState().token } // Assume token is in store
      });

      socket.on('connect', () => console.log('Socket.IO connected'));
      
      socket.on('new_notification', (notification) => {
        addLiveNotification(notification);
      });

      // 2. Expo Push Token Registration
      const registerPush = async () => {
        try {
          const { status: existingStatus } = await NotificationsExpo.getPermissionsAsync();
          let finalStatus = existingStatus;
          
          if (existingStatus !== 'granted') {
            const { status } = await NotificationsExpo.requestPermissionsAsync();
            finalStatus = status;
          }
          
          if (finalStatus !== 'granted') return;

          const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
          if (!projectId) return;

          const tokenData = await NotificationsExpo.getExpoPushTokenAsync({ projectId });
          await api.registerPushToken(tokenData.data, Platform.OS);
        } catch (e) {
          console.log('Push token registration failed', e);
        }
      };

      registerPush();

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    setCurrentScreen('home'); // Reset screen on logout
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#E0F2F1', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
        <AuthScreen />
      </SafeAreaView>
    );
  }

  const renderBuyerScreen = () => {
    switch (currentScreen) {
      case 'home': return <BuyerHome onNavigate={setCurrentScreen} onSelectProduct={setSelectedProduct} />;
      case 'search': return <SearchResults onNavigate={setCurrentScreen} onSelectProduct={setSelectedProduct} />;
      case 'product': return <ProductDetails product={selectedProduct} onNavigate={setCurrentScreen} />;
      case 'price-comparison': return <ProductDetails product={selectedProduct} onNavigate={setCurrentScreen} showComparison />;
      case 'price-drops': return <Favorites onNavigate={setCurrentScreen} onSelectProduct={setSelectedProduct} showPriceDrops />;
      case 'cart': return <Cart onNavigate={setCurrentScreen} />;
      case 'checkout': return <Checkout onNavigate={setCurrentScreen} />;
      case 'orders': return <Orders onNavigate={setCurrentScreen} />;
      case 'favorites': return <Favorites onNavigate={setCurrentScreen} onSelectProduct={setSelectedProduct} />;
      case 'profile': return <BuyerProfile onLogout={handleLogout} />;
      case 'chatbot': return <ChatbotSearch onNavigate={setCurrentScreen} onSelectProduct={setSelectedProduct} />;
      case 'notifications': return <Notifications onNavigate={setCurrentScreen} />;
      case 'price-alerts': return <PriceAlerts onNavigate={setCurrentScreen} onSelectProduct={setSelectedProduct} />;
      default: return <BuyerHome onNavigate={setCurrentScreen} onSelectProduct={setSelectedProduct} />;
    }
  };

  const renderSellerScreen = () => {
    switch (currentScreen) {
      case 'home': return <SellerDashboard onNavigate={setCurrentScreen} />;
      case 'products': return <SellerProducts onNavigate={setCurrentScreen} />;
      case 'add-product': return <AddProduct onNavigate={setCurrentScreen} />;
      case 'orders': return <SellerOrders onNavigate={setCurrentScreen} />;
      case 'profile': return <SellerProfile onLogout={handleLogout} onNavigate={setCurrentScreen} />;
      case 'notifications': return <Notifications onNavigate={setCurrentScreen} />;
      default: return <SellerDashboard onNavigate={setCurrentScreen} />;
    }
  };

  const renderAdminScreen = () => {
    switch (currentScreen) {
      case 'home': return <AdminDashboard onNavigate={setCurrentScreen} onLogout={handleLogout} />;
      case 'seller-approval': return <SellerApproval onNavigate={setCurrentScreen} />;
      case 'user-management': return <UserManagement onNavigate={setCurrentScreen} />;
      case 'disputes': return <DisputeResolution onNavigate={setCurrentScreen} />;
      case 'product-approval': return <ProductApproval onNavigate={setCurrentScreen} />;
      case 'notifications': return <Notifications onNavigate={setCurrentScreen} />;
      default: return <AdminDashboard onNavigate={setCurrentScreen} onLogout={handleLogout} />;
    }
  };

  // Determine which screens should show the bottom nav
  const buyerNavScreens = ['home', 'search', 'cart', 'favorites', 'profile'];
  const sellerNavScreens = ['home', 'products', 'orders', 'profile'];
  const adminNavScreens = ['home', 'seller-approval', 'user-management', 'disputes', 'product-approval'];

  const shouldShowNav = () => {
    if (userRole === 'buyer') return buyerNavScreens.includes(currentScreen);
    if (userRole === 'seller') return sellerNavScreens.includes(currentScreen);
    if (userRole === 'admin') return adminNavScreens.includes(currentScreen);
    return false;
  };

  const renderBottomNav = () => {
    if (!shouldShowNav()) return null;

    if (userRole === 'buyer') {
      return (
        <View style={styles.nav}>
          <NavButton icon={<Ionicons name="home-outline" size={24} color={currentScreen==='home' ? COLORS.primary : COLORS.navInactive} />} label="Home" onPress={()=>setCurrentScreen('home')} active={currentScreen==='home'} />
          <NavButton icon={<Feather name="search" size={24} color={currentScreen==='search' ? COLORS.primary : COLORS.navInactive} />} label="Search" onPress={()=>setCurrentScreen('search')} active={currentScreen==='search'} />
          <NavButton icon={<Feather name="shopping-cart" size={24} color={currentScreen==='cart' ? COLORS.primary : COLORS.navInactive} />} label="Cart" onPress={()=>setCurrentScreen('cart')} active={currentScreen==='cart'} />
          <NavButton icon={<FontAwesome name="heart-o" size={24} color={currentScreen==='favorites' ? COLORS.primary : COLORS.navInactive} />} label="Favorites" onPress={()=>setCurrentScreen('favorites')} active={currentScreen==='favorites'} />
          <NavButton icon={<Ionicons name="person-outline" size={24} color={currentScreen==='profile' ? COLORS.primary : COLORS.navInactive} />} label="Profile" onPress={()=>setCurrentScreen('profile')} active={currentScreen==='profile'} />
        </View>
      );
    } else if (userRole === 'seller') {
      return (
        <View style={styles.nav}>
          <NavButton icon={<MaterialCommunityIcons name="view-dashboard-outline" size={24} color={currentScreen==='home' ? COLORS.primary : COLORS.navInactive} />} label="Dashboard" onPress={()=>setCurrentScreen('home')} active={currentScreen==='home'} />
          <NavButton icon={<Feather name="package" size={24} color={currentScreen==='products' ? COLORS.primary : COLORS.navInactive} />} label="Products" onPress={()=>setCurrentScreen('products')} active={currentScreen==='products'} />
          <NavButton icon={<Feather name="shopping-cart" size={24} color={currentScreen==='orders' ? COLORS.primary : COLORS.navInactive} />} label="Orders" onPress={()=>setCurrentScreen('orders')} active={currentScreen==='orders'} />
          <NavButton icon={<Ionicons name="person-outline" size={24} color={currentScreen==='profile' ? COLORS.primary : COLORS.navInactive} />} label="Profile" onPress={()=>setCurrentScreen('profile')} active={currentScreen==='profile'} />
        </View>
      );
    } else if (userRole === 'admin') {
      return (
        <View style={styles.nav}>
          <NavButton icon={<MaterialCommunityIcons name="view-dashboard-outline" size={24} color={currentScreen==='home' ? COLORS.primary : COLORS.navInactive} />} label="Dashboard" onPress={()=>setCurrentScreen('home')} active={currentScreen==='home'} />
          <NavButton icon={<Ionicons name="people-outline" size={24} color={currentScreen==='seller-approval' ? COLORS.primary : COLORS.navInactive} />} label="Sellers" onPress={()=>setCurrentScreen('seller-approval')} active={currentScreen==='seller-approval'} />
          <NavButton icon={<Ionicons name="person-outline" size={24} color={currentScreen==='user-management' ? COLORS.primary : COLORS.navInactive} />} label="Users" onPress={()=>setCurrentScreen('user-management')} active={currentScreen==='user-management'} />
          <NavButton icon={<Feather name="alert-circle" size={24} color={currentScreen==='disputes' ? COLORS.primary : COLORS.navInactive} />} label="Disputes" onPress={()=>setCurrentScreen('disputes')} active={currentScreen==='disputes'} />
        </View>
      );
    }
    return null;
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top, paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.content}>
        {userRole === 'buyer' && renderBuyerScreen()}
        {userRole === 'seller' && renderSellerScreen()}
        {userRole === 'admin' && renderAdminScreen()}
      </View>
      {renderBottomNav()}
      <Toaster />
    </View>
  );
}

// ── Main App with AuthProvider wrapper ──
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const NavButton = ({ icon, label, onPress, active }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.navButton}>
    {icon}
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  nav: { flexDirection: 'row', height: 60, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.card, justifyContent: 'space-around', alignItems: 'center' },
  navButton: { justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 10, marginTop: 2, color: COLORS.navInactive },
  navLabelActive: { fontWeight: 'bold', color: COLORS.primary },
});