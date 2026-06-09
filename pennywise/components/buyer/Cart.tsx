import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';
import useCartStore from '../../store/cartStore';

interface CartProps {
  onNavigate: (screen: string) => void;
}

export default function Cart({ onNavigate }: CartProps) {
  const { cartItems, fetchCart, updateQuantity, removeItem, clearCart, isLoading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = (id: string, change: number, currentQuantity: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    } else {
      removeItem(id);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0);

  return (
    <LinearGradient
      colors={['#00546105', '#ffffff', '#00B7B505']}
      style={{ flex: 1 }}
    >
      {/* Header */}
      <LinearGradient
        colors={['#005461', '#018790']}
        style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}
      >
        <TouchableOpacity onPress={() => onNavigate('home')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, marginLeft: 12 }}>
          Shopping Cart ({cartItems.length})
        </Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {cartItems.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Feather name="shopping-bag" size={64} color="#ccc" style={{ marginBottom: 16 }} />
            <Text style={{ color: '#888', marginBottom: 16 }}>Your cart is empty</Text>
            <LinearGradient
              colors={['#005461', '#018790']}
              style={{ borderRadius: 12 }}
            >
              <TouchableOpacity
                onPress={() => onNavigate('home')}
                style={{ paddingVertical: 12, paddingHorizontal: 32 }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Start Shopping</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
            cartItems.map((item) => (
              <View
                key={item._id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 24,
                  padding: 16,
                  marginBottom: 16,
                  flexDirection: 'row',
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    backgroundColor: '#00546110',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  {item.product_id?.thumbnail ? (
                    <Image source={{ uri: item.product_id.thumbnail }} style={{ width: 60, height: 60, borderRadius: 12 }} />
                  ) : (
                    <Feather name="package" size={40} color="#005461" />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, marginBottom: 4 }}>{item.product_id?.name || 'Unknown Product'}</Text>
                  <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {item.product_id?.seller_id?.store_name || 'PennyWise Seller'}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#005461', fontWeight: '600', marginBottom: 8 }}>
                    PKR {item.price_snapshot.toLocaleString()}
                  </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#00546133',
                      paddingHorizontal: 4,
                    }}
                  >
                    <TouchableOpacity onPress={() => handleUpdateQuantity(item._id, -1, item.quantity)} style={{ padding: 4 }}>
                      <Feather name="minus" size={16} color="#005461" />
                    </TouchableOpacity>
                    <Text style={{ paddingHorizontal: 8 }}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(item._id, 1, item.quantity)} style={{ padding: 4 }}>
                      <Feather name="plus" size={16} color="#005461" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => handleRemoveItem(item._id)} style={{ padding: 4 }}>
                    <Feather name="trash-2" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Bottom Checkout */}
      {cartItems.length > 0 && (
        <View style={{ position: 'absolute', bottom: 0, width: '100%', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' }}>
          <View style={{ backgroundColor: '#00B7B505', borderRadius: 24, padding: 16, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Subtotal ({cartItems.length} items)</Text>
              <Text style={{ fontSize: 12 }}>PKR {total.toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>Shipping</Text>
              <Text style={{ fontSize: 12 }}>PKR 200</Text>
            </View>
            <View style={{ borderTopWidth: 1, borderColor: '#eee', paddingTop: 4, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Total</Text>
              <Text style={{ fontSize: 14, color: '#005461', fontWeight: '600' }}>PKR {(total + 200).toLocaleString()}</Text>
            </View>
          </View>

          <LinearGradient
            colors={['#005461', '#018790', '#00B7B5']}
            style={{ borderRadius: 12 }}
          >
            <TouchableOpacity
              onPress={() => onNavigate('checkout')}
              style={{ paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </LinearGradient>
  );
}
