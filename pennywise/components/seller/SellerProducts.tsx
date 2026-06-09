// SellerProducts.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../theme';
import useProductStore from '../../store/productStore';

interface SellerProductsProps {
  onNavigate: (screen: string) => void;
}

export default function SellerProducts({ onNavigate }: SellerProductsProps) {
  const { myProducts, fetchMyProducts, isLoading } = useProductStore();
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'view'>('list');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setCurrentView('edit');
  };

  const handleView = (product: any) => {
    setSelectedProduct(product);
    setCurrentView('view');
  };

  if (currentView === 'edit') {
    return <EditProductScreen product={selectedProduct} onBack={() => setCurrentView('list')} />;
  }

  if (currentView === 'view') {
    return <ViewProductScreen product={selectedProduct} onBack={() => setCurrentView('list')} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => onNavigate('home')}>
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Products</Text>
          </View>
          <TouchableOpacity onPress={() => onNavigate('add-product')}>
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Products */}
      <View style={{ padding: 16 }}>
        {isLoading && (!myProducts || myProducts.length === 0) ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (!myProducts || myProducts.length === 0) ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Feather name="package" size={48} color={COLORS.textMuted} />
            <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>No products found</Text>
            <TouchableOpacity 
              style={{ marginTop: 16, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.md }}
              onPress={() => onNavigate('add-product')}
            >
              <Text style={{ color: 'white' }}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          (myProducts || []).map((product: any) => (
            <View key={product._id} style={styles.productCard}>
              <View style={styles.productRow}>
                <View style={styles.productImageBox}>
                  {product.thumbnail ? (
                    <Image source={{ uri: product.thumbnail }} style={{ width: 60, height: 60, borderRadius: 8 }} />
                  ) : (
                    <Feather name="image" size={32} color="#aaa" />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.productHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.productPrice}>
                        PKR {product.price.toLocaleString()}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        product.status === 'approved'
                          ? styles.active
                          : product.status === 'inactive'
                          ? styles.inactive
                          : product.status === 'rejected'
                          ? styles.rejected
                          : styles.pending,
                      ]}
                    >
                      <Text style={styles.statusText}>{product.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.productMeta}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="package-variant" size={14} color="#555" />
                      <Text style={styles.metaText}>Stock: {product.stock_quantity}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Feather name="star" size={14} color="#F59E0B" />
                      <Text style={styles.metaText}>{product.average_rating || 0}</Text>
                    </View>

                    <Text style={styles.metaText}>Views: {product.total_views || 0}</Text>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#018790' }]}
                      onPress={() => handleView(product)}
                    >
                      <Feather name="eye" size={14} color="white" />
                      <Text style={styles.actionText}>View</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#005461' }]}
                      onPress={() => handleEdit(product)}
                    >
                      <Feather name="edit" size={14} color="white" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

/* ---------------- EDIT SCREEN ---------------- */
function EditProductScreen({ product, onBack }: any) {
  const { updateProduct } = useProductStore();
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock_quantity));
  
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('stock_quantity', stock);
      await updateProduct(product._id, formData);
      Alert.alert('Saved', 'Product changes saved successfully.');
      onBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Product</Text>
        </View>
      </View>
      <View style={{ padding: 16 }}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Product Name" placeholderTextColor="#9ca3af" />
        <Text style={styles.label}>Price (PKR)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Price" placeholderTextColor="#9ca3af" />
        <Text style={styles.label}>Stock Quantity</Text>
        <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="Stock" placeholderTextColor="#9ca3af" />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Feather name="save" size={18} color="white" />
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ---------------- VIEW SCREEN ---------------- */
function ViewProductScreen({ product, onBack }: any) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
        </View>
      </View>
      <View style={{ padding: 16 }}>
        <View style={styles.detailsCard}>
          {product.thumbnail ? (
            <Image source={{ uri: product.thumbnail }} style={{ width: 150, height: 150, borderRadius: RADIUS.md }} />
          ) : (
             <Feather name="image" size={70} color="#ccc" />
          )}
          <Text style={styles.detailsName}>{product.name}</Text>
          <Text style={styles.detailsPrice}>PKR {product.price.toLocaleString()}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6 }}>
            <Feather name="star" size={16} color="#F59E0B" />
            <Text style={{ marginLeft: 4 }}>{product.average_rating || 0} Rating</Text>
          </View>
        </View>
        <View style={styles.infoCard}>
          <InfoRow label="Status" value={product.status.toUpperCase()} />
          <InfoRow label="Stock" value={`${product.stock_quantity} units`} />
          <InfoRow label="Total Views" value={`${product.total_views || 0}`} />
          <InfoRow label="Description" value={product.description || 'No description'} />
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <View style={styles.infoRow}>
      <Text style={{ color: '#666', width: 100 }}>{label}</Text>
      <Text style={{ fontWeight: '600', flex: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: '#005461', padding: 16, paddingTop: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  productCard: { backgroundColor: 'white', borderRadius: 16, padding: 12, marginBottom: 16 },
  productRow: { flexDirection: 'row', gap: 12 },
  productImageBox: { backgroundColor: '#E0F2F1', padding: 6, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  productName: { fontSize: 14, fontWeight: '600' },
  productPrice: { color: '#005461', fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  active: { backgroundColor: '#10B981' },
  inactive: { backgroundColor: '#6B7280' },
  pending: { backgroundColor: '#F59E0B' },
  rejected: { backgroundColor: '#EF4444' },
  statusText: { color: 'white', fontSize: 10 },
  productMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#555' },
  buttonRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
  actionText: { color: 'white', fontSize: 12 },
  label: { marginTop: 12, marginBottom: 4, fontSize: 12, color: '#555' },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 12, marginBottom: 8 },
  saveBtn: { backgroundColor: '#005461', marginTop: 16, padding: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  saveText: { color: 'white', fontWeight: 'bold' },
  detailsCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  detailsName: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  detailsPrice: { fontSize: 20, color: '#005461', marginVertical: 8 },
  infoCard: { backgroundColor: 'white', borderRadius: 16, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
});
