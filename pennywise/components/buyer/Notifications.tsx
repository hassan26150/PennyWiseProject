import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useNotificationStore from '../../store/notificationStore';

const getIconForType = (type: string) => {
  switch (type) {
    case 'order_placed': case 'order_confirmed': return { name: 'package', color: '#3B82F6', bg: '#EFF6FF' };
    case 'order_processing': case 'order_shipped': return { name: 'truck', color: '#8B5CF6', bg: '#F5F3FF' };
    case 'order_delivered': return { name: 'check-circle', color: '#10B981', bg: '#D1FAE5' };
    case 'order_cancelled': return { name: 'x-circle', color: '#EF4444', bg: '#FEE2E2' };
    case 'price_drop': return { name: 'trending-down', color: '#10B981', bg: '#D1FAE5' };
    case 'dispute_opened': case 'dispute_resolved': return { name: 'alert-triangle', color: '#F59E0B', bg: '#FEF3C7' };
    case 'seller_approved': case 'listing_approved': return { name: 'check-circle', color: '#10B981', bg: '#D1FAE5' };
    case 'seller_rejected': case 'listing_rejected': return { name: 'x-circle', color: '#EF4444', bg: '#FEE2E2' };
    case 'low_stock_alert': return { name: 'alert-circle', color: '#EF4444', bg: '#FEE2E2' };
    case 'new_review': return { name: 'star', color: '#F59E0B', bg: '#FEF3C7' };
    case 'promotion': return { name: 'tag', color: '#EC4899', bg: '#FCE7F3' };
    default: return { name: 'bell', color: '#6B7280', bg: '#F3F4F6' };
  }
};

const formatTimeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export default function Notifications({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { 
    notifications, 
    isLoading, 
    isFetchingMore, 
    fetchNotifications, 
    loadMore, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handlePress = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Deep linking simulation
    if (notification.data?.screen) {
      onNavigate(notification.data.screen);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const iconData = getIconForType(item.type);
    
    return (
      <TouchableOpacity 
        onPress={() => handlePress(item)}
        style={{
          flexDirection: 'row',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
          backgroundColor: item.read ? '#fff' : '#F0FDFA'
        }}
      >
        <View style={{ 
          width: 48, height: 48, borderRadius: 24, 
          backgroundColor: iconData.bg, 
          justifyContent: 'center', alignItems: 'center',
          marginRight: 12
        }}>
          <Feather name={iconData.name as any} size={24} color={iconData.color} />
        </View>
        
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ fontWeight: item.read ? '500' : '700', fontSize: 16, color: '#111827', flex: 1 }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 8 }}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
          <Text style={{ color: '#4B5563', marginTop: 4, lineHeight: 20 }}>
            {item.body}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <LinearGradient colors={['#005461', '#00B7B5']} style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, marginLeft: 8, flex: 1 }}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={{ color: '#fff', fontSize: 14 }}>Mark all read</Text>
        </TouchableOpacity>
      </LinearGradient>

      {isLoading && notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#005461" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ margin: 20 }} color="#005461" /> : null}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Feather name="bell-off" size={64} color="#D1D5DB" />
              <Text style={{ color: '#6B7280', marginTop: 16, fontSize: 16 }}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
