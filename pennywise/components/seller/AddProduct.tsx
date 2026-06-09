// AddProduct.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import useProductStore from '../../store/productStore';
import useCategoryStore from '../../store/categoryStore';
import { Modal } from 'react-native';

interface AddProductProps {
  onNavigate: (screen: string) => void;
}

export default function AddProduct({ onNavigate }: AddProductProps) {
  const { createProduct, isLoading } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(''); // ObjectId of category
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }

    // Launch picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets]);
    }
  };

  const handleAddProduct = async () => {
    if (!name || !price || !category || !description || !stock) {
      Alert.alert('Error', 'Please fill all required fields, including stock quantity');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock_quantity', stock);
    formData.append('category_id', category);
    formData.append('description', description);

    // Append images
    images.forEach((img, index) => {
      // Create a valid file object from the URI
      const filename = img.uri.split('/').pop() || `image-${index}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('images', {
        uri: img.uri,
        name: filename,
        type,
      } as any);
    });

    try {
      await createProduct(formData);
      Alert.alert('Success', 'Product added successfully and is pending approval!');
      onNavigate('products');
    } catch (error) {
      Alert.alert('Error', useProductStore.getState().error || 'Failed to add product');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradientPrimary} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => onNavigate('products')}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Product</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Product Images */}
        <View style={styles.card}>
          <View style={styles.labelContainer}>
            <MaterialIcons name="image" size={18} color={COLORS.secondary} />
            <Text style={styles.labelText}>Product Images ({images.length}/5)</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imagePreviewContainer}>
                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageBtn}
                  onPress={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Feather name="x" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 5 && (
              <TouchableOpacity style={styles.uploadBoxSmall} onPress={pickImage}>
                <Feather name="plus" size={24} color={COLORS.secondary} />
                <Text style={styles.uploadTextSmall}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Basic Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter product name" 
              placeholderTextColor="#9ca3af"
              value={name} 
              onChangeText={setName} 
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity 
              style={styles.input} 
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={{ color: category ? COLORS.textPrimary : '#9ca3af' }}>
                {category ? (categories || []).find((c: any) => c._id === category)?.name || category : 'Select a category'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description *</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              placeholder="Describe your product" 
              placeholderTextColor="#9ca3af"
              multiline 
              value={description} 
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Pricing & Stock */}
        <View style={[styles.card, styles.pricingCard]}>
          <Text style={styles.sectionTitle}>
            <FontAwesome5 name="dollar-sign" size={18} color={COLORS.secondary} /> Pricing & Stock
          </Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Price (PKR) *</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                placeholder="0" 
                placeholderTextColor="#9ca3af"
                value={price} 
                onChangeText={setPrice} 
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric" 
                placeholder="0" 
                placeholderTextColor="#9ca3af"
                value={stock} 
                onChangeText={setStock} 
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Feather name="x" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              placeholder="Search or type new category..."
              placeholderTextColor="#9ca3af"
              value={categorySearch}
              onChangeText={setCategorySearch}
            />
            <ScrollView>
              {(categories || [])
                .filter((c: any) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                .map((cat: any) => (
                <TouchableOpacity 
                  key={cat._id} 
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(cat._id);
                    setShowCategoryModal(false);
                    setCategorySearch('');
                  }}
                >
                  <Text style={styles.modalItemText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
              
              {categorySearch.trim().length > 0 && !(categories || []).find((c: any) => c.name.toLowerCase() === categorySearch.trim().toLowerCase()) && (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(categorySearch.trim());
                    setShowCategoryModal(false);
                    setCategorySearch('');
                  }}
                >
                  <Text style={[styles.modalItemText, { color: COLORS.primary, fontWeight: 'bold' }]}>
                    + Add "{categorySearch.trim()}"
                  </Text>
                </TouchableOpacity>
              )}

              {(!categories || categories.length === 0) && categorySearch.length === 0 && (
                <Text style={{ padding: 16, textAlign: 'center', color: '#666' }}>Type to create a category</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Button */}
      <View style={styles.bottom}>
        <LinearGradient colors={COLORS.gradientFull} style={{ borderRadius: RADIUS.lg }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddProduct}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="check" size={20} color="white" />
                <Text style={styles.addButtonText}>Submit Product</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, paddingTop: 40 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  content: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 16, marginBottom: 16, ...SHADOWS.sm },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 4 },
  labelText: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  imagePreviewScroll: { flexDirection: 'row' },
  imagePreviewContainer: { marginRight: 12, position: 'relative' },
  imagePreview: { width: 80, height: 80, borderRadius: RADIUS.md, backgroundColor: '#f3f4f6' },
  removeImageBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: 'red', borderRadius: 12, padding: 4 },
  uploadBoxSmall: { width: 80, height: 80, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.accent, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentTint },
  uploadTextSmall: { fontSize: 10, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  field: { marginBottom: 12 },
  label: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: 12, backgroundColor: COLORS.card },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfField: { flex: 0.48 },
  pricingCard: { backgroundColor: COLORS.accentTint, borderColor: 'rgba(0,183,181,0.2)', borderWidth: 1 },
  bottom: { position: 'absolute', bottom: 0, width: '100%', padding: 16, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border },
  addButton: { flexDirection: 'row', paddingVertical: 14, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', gap: 8 },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalItemText: { fontSize: 16, color: COLORS.textPrimary },
});