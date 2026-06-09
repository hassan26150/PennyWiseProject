import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Linking } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../theme';
import useOrderStore from '../../store/orderStore';
import useReviewStore from '../../store/reviewStore';
import useDisputeStore from '../../store/disputeStore';
import useCartStore from '../../store/cartStore';
import { TextInput, Modal } from 'react-native';

interface OrdersProps {
  onNavigate: (screen: string) => void;
}

export default function Orders({ onNavigate }: OrdersProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const { buyerOrders, fetchBuyerOrders, cancelOrder, getOrderInvoice, isLoading } = useOrderStore();
  const { submitReview } = useReviewStore();
  const { openDispute } = useDisputeStore();
  const { addToCart } = useCartStore();

  const [reviewModal, setReviewModal] = useState({ visible: false, orderId: '', productId: '', productName: '' });
  const [disputeModal, setDisputeModal] = useState({ visible: false, orderId: '' });
  
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  
  const [issueType, setIssueType] = useState('PRODUCT_NOT_RECEIVED');
  const [disputeDesc, setDisputeDesc] = useState('');

  useEffect(() => {
    fetchBuyerOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Feather name="clock" size={16} color="#018790" />;
      case 'confirmed': return <Feather name="check" size={16} color="#018790" />;
      case 'processing': return <Feather name="settings" size={16} color="#018790" />;
      case 'shipped': return <MaterialCommunityIcons name="truck" size={16} color="#00B7B5" />;
      case 'delivered': return <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />;
      case 'cancelled': return <MaterialCommunityIcons name="close-circle" size={16} color={COLORS.error} />;
      default: return <Feather name="package" size={16} color="#6B7280" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': 
      case 'confirmed': 
      case 'processing': return { backgroundColor: '#01879020', borderColor: '#01879050', color: '#018790' };
      case 'shipped': return { backgroundColor: '#00B7B520', borderColor: '#00B7B550', color: '#00B7B5' };
      case 'delivered': return { backgroundColor: '#10B98120', borderColor: '#10B98150', color: '#10B981' };
      case 'cancelled': return { backgroundColor: COLORS.errorTint, borderColor: '#FCA5A5', color: COLORS.error };
      default: return { backgroundColor: '#E5E7EB', borderColor: '#D1D5DB', color: '#6B7280' };
    }
  };

  const orders = activeTab === 'active' 
    ? buyerOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
    : buyerOrders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  const handleDownloadInvoice = async (id: string) => {
    try {
      const api = require('../../api/client').default;
      const res = await api.get(`/orders/${id}/invoice`);
      if (res.data?.pdf_url) {
        Linking.openURL(res.data.pdf_url);
      } else {
        Alert.alert('Error', 'Invoice not found');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch invoice');
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await submitReview(reviewModal.orderId, reviewModal.productId, Number(rating), comment);
      Alert.alert('Success', 'Review submitted successfully!');
      setReviewModal({ visible: false, orderId: '', productId: '', productName: '' });
      setRating('5');
      setComment('');
    } catch (e) {
      Alert.alert('Error', 'Failed to submit review. You may have already reviewed this product.');
    }
  };

  const handleDisputeSubmit = async () => {
    try {
      await openDispute(disputeModal.orderId, issueType, disputeDesc);
      Alert.alert('Success', 'Dispute opened successfully!');
      setDisputeModal({ visible: false, orderId: '' });
      setDisputeDesc('');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || e.message || 'Failed to open dispute.');
    }
  };

  const handleReorder = async (orderItems: any[]) => {
    try {
      for (const item of orderItems) {
        await addToCart(item.product_id, item.quantity);
      }
      Alert.alert('Success', 'Items added to cart!');
      onNavigate('cart');
    } catch (e) {
      Alert.alert('Error', 'Failed to reorder items');
    }
  };

  return (
    <LinearGradient colors={['#00546105', '#fff', '#00B7B505']} style={{ flex: 1, paddingBottom: 24 }}>
      {/* Header */}
      <LinearGradient colors={['#005461', '#018790']} style={{ padding: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={{ padding: 8 }}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 20, marginLeft: 8 }}>My Orders</Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 4 }}>
          {['active', 'completed'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as 'active' | 'completed')}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor: activeTab === tab ? '#fff' : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: activeTab === tab ? '#005461' : 'rgba(255,255,255,0.7)', fontWeight: '500' }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Orders List */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#005461" style={{ marginTop: 50 }} />
        ) : orders.length === 0 ? (
          <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
            <Feather name="package" size={64} color="#D1D5DB" />
            <Text style={{ color: '#6B7280', marginTop: 12 }}>No {activeTab} orders</Text>
          </View>
        ) : (
          orders.map((order) => {
            const statusStyle = getStatusStyle(order.status);
            return (
              <View key={order._id} style={{ backgroundColor: '#fff', borderRadius: 20, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' }}>
                {/* Order Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 8 }}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      {getStatusIcon(order.status)}
                      <Text style={{ color: '#005461', fontWeight: '500', marginLeft: 6 }}>{order._id.slice(-6).toUpperCase()}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>{new Date(order.created_at).toLocaleDateString()}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor, borderWidth: 1 }}>
                      <Text style={{ fontSize: 10, color: statusStyle.color }}>{order.status.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDownloadInvoice(order._id)}>
                      <Text style={{ fontSize: 10, color: '#018790', textDecorationLine: 'underline' }}>Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Order Items */}
                {order.items.map((item, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <View style={{ backgroundColor: '#00546110', width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 8, overflow: 'hidden' }}>
                      {item.thumbnail ? (
                        <Image source={{ uri: item.thumbnail }} style={{ width: 48, height: 48 }} />
                      ) : (
                        <Feather name="package" size={24} color="#005461" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '500' }}>{item.product_name}</Text>
                      <Text style={{ fontSize: 10, color: '#6B7280' }}>Qty: {item.quantity}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '500', color: '#005461' }}>PKR {item.price.toLocaleString()}</Text>
                      
                      {order.status === 'delivered' && (
                        <TouchableOpacity
                          style={{ marginTop: 4, alignSelf: 'flex-start' }}
                          onPress={() => setReviewModal({ visible: true, orderId: order._id, productId: item.product_id, productName: item.product_name })}
                        >
                          <Text style={{ fontSize: 10, color: COLORS.primary, textDecorationLine: 'underline' }}>Write Review</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}

                {/* COD Badge */}
                <View style={{ backgroundColor: '#00B7B510', padding: 6, borderRadius: 12, borderWidth: 1, borderColor: '#00B7B550', marginBottom: 8 }}>
                  <Text style={{ fontSize: 10, color: '#6B7280' }}>💵 Payment: {order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method}</Text>
                </View>

                {/* Total & Action */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8 }}>
                  <View>
                    <Text style={{ fontSize: 10, color: '#6B7280' }}>Total Amount</Text>
                    <Text style={{ fontSize: 12, fontWeight: '500', color: '#005461' }}>PKR {order.total_amount.toLocaleString()}</Text>
                  </View>
                  {activeTab === 'active' ? (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {order.status === 'pending' && (
                        <TouchableOpacity
                          style={{ borderWidth: 1, borderColor: COLORS.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
                          onPress={() => {
                            Alert.alert('Cancel Order', 'Are you sure you want to cancel?', [
                              { text: 'No', style: 'cancel' },
                              { text: 'Yes', onPress: () => cancelOrder(order._id) }
                            ]);
                          }}
                        >
                          <Text style={{ color: COLORS.error, fontSize: 12 }}>Cancel</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={{ backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
                        onPress={() => Alert.alert('Track Order', `Tracking info: ${order.tracking_number || 'Not available yet'}`)}
                      >
                        <Text style={{ color: '#fff', fontSize: 12 }}>Track</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        style={{ borderWidth: 1, borderColor: COLORS.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
                        onPress={() => setDisputeModal({ visible: true, orderId: order._id })}
                      >
                        <Text style={{ color: COLORS.error, fontSize: 12 }}>Dispute</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
                        onPress={() => handleReorder(order.items)}
                      >
                        <Text style={{ color: COLORS.primary, fontSize: 12 }}>Reorder</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={reviewModal.visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Review {reviewModal.productName}</Text>
            
            <Text style={{ fontSize: 12, marginBottom: 4 }}>Rating (1-5)</Text>
            <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 12 }} value={rating} onChangeText={setRating} keyboardType="numeric" />
            
            <Text style={{ fontSize: 12, marginBottom: 4 }}>Comment</Text>
            <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 16, height: 80 }} value={comment} onChangeText={setComment} multiline />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={() => setReviewModal({ visible: false, orderId: '', productId: '', productName: '' })}>
                <Text style={{ color: '#666', padding: 10 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReviewSubmit} style={{ backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dispute Modal */}
      <Modal visible={disputeModal.visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Open Dispute</Text>
            
            <Text style={{ fontSize: 12, marginBottom: 4 }}>Issue Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {['PRODUCT_NOT_RECEIVED', 'DAMAGED_PRODUCT', 'WRONG_PRODUCT', 'MISSING_ITEMS', 'REFUND_REQUEST', 'SELLER_UNRESPONSIVE', 'OTHER'].map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setIssueType(type)}
                  style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: issueType === type ? COLORS.error : '#ccc', backgroundColor: issueType === type ? COLORS.errorTint : 'transparent' }}
                >
                  <Text style={{ fontSize: 10, color: issueType === type ? COLORS.error : '#666' }}>{type.replace(/_/g, ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={{ fontSize: 12, marginBottom: 4 }}>Description</Text>
            <TextInput style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 16, height: 80 }} value={disputeDesc} onChangeText={setDisputeDesc} multiline />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={() => setDisputeModal({ visible: false, orderId: '' })}>
                <Text style={{ color: '#666', padding: 10 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDisputeSubmit} style={{ backgroundColor: COLORS.error, padding: 10, borderRadius: 8 }}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Open Dispute</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}
