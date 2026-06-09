import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';
import useCartStore from '../../store/cartStore';
import useOrderStore from '../../store/orderStore';
import useAuthStore from '../../store/authStore';

interface CheckoutProps {
  onNavigate: (screen: string) => void;
}

export default function Checkout({ onNavigate }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const { cartItems, fetchCart } = useCartStore();
  const { checkout, isLoading } = useOrderStore();
  const { user } = useAuthStore();
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price_snapshot * item.quantity, 0);
  const shippingFee = 200;
  const serviceFee = 50;
  const total = subtotal + shippingFee + serviceFee;

  const handleCheckout = async () => {
    try {
      const shippingAddress = {
        full_name: user?.name || 'PennyWise User',
        address: '123 Main Street, Block A', // Hardcoded for now per instructions
        city: 'Lahore, Punjab 54000',
        phone: '+92 300 1234567'
      };
      
      const res = await checkout(shippingAddress, paymentMethod);
      Alert.alert('Order Placed', 'Order placed successfully! Check your orders tab.');
      onNavigate('orders');
    } catch (error) {
      Alert.alert('Checkout Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <LinearGradient colors={['#00546105', '#fff', '#00B7B505']} style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient colors={['#005461', '#018790']} style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => onNavigate('cart')} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, marginLeft: 12 }}>Checkout</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Shipping Address */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,87,97,0.125)' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="map-pin" size={18} color="#005461" />
              <Text style={{ fontSize: 14, color: '#111827' }}>Shipping Address</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Edit Address', 'Address editing will be available after backend integration.')}>
              <Text style={{ fontSize: 12, color: COLORS.primary }}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: 'rgba(0,183,181,0.1)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,87,97,0.1)' }}>
            <Text style={{ fontSize: 14, marginBottom: 2 }}>{user?.name || 'PennyWise User'}</Text>
            <Text style={{ fontSize: 14, color: '#4B5563' }}>123 Main Street, Block A</Text>
            <Text style={{ fontSize: 14, color: '#4B5563' }}>Lahore, Punjab 54000</Text>
            <Text style={{ fontSize: 14, color: '#4B5563', marginTop: 4 }}>+92 300 1234567</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={{ backgroundColor: 'rgba(0,183,181,0.1)', borderRadius: 24, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,183,181,0.5)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Feather name="credit-card" size={18} color="#00B7B5" />
            <Text style={{ fontSize: 14, color: '#111827', marginLeft: 6 }}>Payment Method</Text>
          </View>

          {/* COD Option */}
          <LinearGradient colors={['#005461', '#018790']} style={{ borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 50, marginRight: 8 }}>
                <Feather name="package" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '500' }}>Cash on Delivery (COD)</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Pay when you receive your order</Text>
              </View>
              <View style={{ backgroundColor: '#10B981', borderRadius: 50, padding: 4 }}>
                <Feather name="check" size={20} color="#fff" />
              </View>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 6 }}>
              <Text style={{ fontSize: 12 }}>💵 Only payment method available for PennyWise orders</Text>
            </View>
          </LinearGradient>

          {/* Disabled Methods */}
          <View style={{ opacity: 0.5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', marginBottom: 8 }}>
              <Feather name="credit-card" size={20} color="#9CA3AF" />
              <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 6 }}>Credit/Debit Card (Coming Soon)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
              <Feather name="zap" size={20} color="#9CA3AF" />
              <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 6 }}>JazzCash/EasyPaisa (Coming Soon)</Text>
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' }}>
          <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 12 }}>Order Summary</Text>
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#4B5563' }}>Subtotal ({totalItems} items)</Text>
              <Text style={{ fontSize: 12 }}>PKR {subtotal.toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: '#4B5563' }}>Shipping Fee</Text>
              <Text style={{ fontSize: 12 }}>PKR {shippingFee.toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#4B5563' }}>Service Fee</Text>
              <Text style={{ fontSize: 12 }}>PKR {serviceFee.toLocaleString()}</Text>
            </View>
          </View>
          <View style={{ borderTopWidth: 1, borderColor: '#E5E7EB', paddingTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Total</Text>
              <Text style={{ color: '#005461', fontWeight: '500' }}>PKR {total.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={{ padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E5E7EB' }}>
        <LinearGradient colors={['#005461', '#018790', '#00B7B5']} style={{ borderRadius: 16 }}>
          <TouchableOpacity
            onPress={handleCheckout}
            disabled={isLoading}
            style={{ paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, opacity: isLoading ? 0.7 : 1 }}
          >
            <Feather name="check" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '500' }}>
              {isLoading ? 'Processing...' : `Place Order - PKR ${total.toLocaleString()} (COD)`}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

