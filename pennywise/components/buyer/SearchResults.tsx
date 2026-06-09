// SearchResults.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS } from '../../theme';
import useProductStore from '../../store/productStore';

interface SearchResultsProps {
  onNavigate: (screen: string) => void;
  onSelectProduct: (product: any) => void;
}

export default function SearchResults({ onNavigate, onSelectProduct }: SearchResultsProps) {
  const { searchResults, searchProducts, publicProducts, fetchPublicProducts, isLoading } = useProductStore();
  const [query, setQuery] = useState('');
  
  const [filters, setFilters] = useState({ priceRange: '', rating: '', sort: '' });
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchData();
  }, [filters]);

  const fetchData = () => {
    if (query.trim().length > 0) {
      searchProducts(query);
    } else {
      let params: any = {};
      
      // Price range
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-');
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
      }
      
      // Sort
      if (filters.sort) {
        params.sort = filters.sort;
      }

      fetchPublicProducts(params);
    }
  };

  const handleSearchSubmit = () => {
    fetchData();
  };

  const clearFilters = () => setFilters({ priceRange: '', rating: '', sort: '' });

  // Use searchResults if a query was run, otherwise publicProducts
  const products = query.trim().length > 0 ? (searchResults || []) : (publicProducts || []);

  return (
    <View style={styles.container}>
      {/* Header + Search */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => onNavigate('home')}>
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
        </View>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput 
            placeholder="Search for products..." 
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            style={styles.searchInput} 
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Filters */}
        <View style={styles.filters}>
          <View style={styles.filtersHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="sliders" size={18} color={COLORS.primary} />
              <Text style={styles.filtersTitle}>Filters</Text>
            </View>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Price */}
          <Text style={styles.filterLabel}>Price Range</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {['','0-30000','30000-60000','60000-100000','100000-99999999'].map((range,i)=>(
              <TouchableOpacity
                key={i}
                onPress={()=>setFilters({...filters, priceRange: range})}
                style={[
                  styles.priceButton,
                  filters.priceRange===range && styles.priceButtonActive
                ]}
              >
                <Text style={[
                  styles.priceText,
                  filters.priceRange===range && styles.priceTextActive
                ]}>
                  {range===''?'Any':range==='0-30000'?'Under 30k':range==='30000-60000'?'30k-60k':range==='60000-100000'?'60k-100k':'Above 100k'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Rating */}
          <Text style={styles.filterLabel}>Minimum Rating</Text>
          <View style={styles.ratingContainer}>
            {['','4','4.2','4.5','4.8'].map((r,i)=>(
              <TouchableOpacity
                key={i}
                onPress={()=>setFilters({...filters, rating:r})}
                style={[
                  styles.ratingButton,
                  filters.rating===r && styles.ratingButtonActive
                ]}
              >
                <Text style={[
                  styles.ratingText,
                  filters.rating===r && styles.ratingTextActive
                ]}>
                  {r===''?'Any':r+'+'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sort & Count */}
        <View style={styles.sortContainer}>
          <Text style={styles.productsCount}>{(products || []).length} products found</Text>
          <TouchableOpacity onPress={()=>setShowSortMenu(!showSortMenu)} style={styles.sortButton}>
            <Feather name="sliders" size={16} color={COLORS.primary}/>
            <Text style={{marginLeft:4}}>Sort</Text>
          </TouchableOpacity>
        </View>

        {showSortMenu && (
          <View style={styles.sortMenu}>
            {['','price_asc','price_desc','rating'].map((s,i)=>{
              const label = s===''?'Newest':s==='price_asc'?'Price: Low to High':s==='price_desc'?'Price: High to Low':'Highest Rated';
              return (
                <TouchableOpacity key={i} onPress={()=>{setFilters({...filters, sort: s}); setShowSortMenu(false)}} style={[
                  styles.sortOption,
                  filters.sort===s && styles.sortOptionActive
                ]}>
                  <Text style={filters.sort===s?styles.sortOptionTextActive:styles.sortOptionText}>{label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Products */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.productsGrid}>
            {(products || []).map((product: any)=>(
              <TouchableOpacity
                key={product._id}
                style={styles.productCard}
                onPress={()=>{onSelectProduct(product); onNavigate('product');}}
              >
                {product.thumbnail ? (
                  <Image source={{ uri: product.thumbnail }} style={{ width: '100%', height: 100, borderRadius: RADIUS.md, marginBottom: 8 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: '100%', height: 100, backgroundColor: '#eee', borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <Feather name="image" size={30} color="#ccc" />
                  </View>
                )}
                
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <View style={styles.productRating}>
                  <FontAwesome name="star" size={14} color={COLORS.star}/>
                  <Text style={styles.productRatingText}>{product.average_rating || 0}</Text>
                  <Text style={styles.productReviews}>({product.total_reviews || 0})</Text>
                </View>
                <Text style={styles.productPrice}>PKR {product.price.toLocaleString()}</Text>
                <Text style={styles.productSeller}>{product.seller_id?.storeName || 'PennyWise'}</Text>
              </TouchableOpacity>
            ))}
            {(products || []).length===0 && (
              <View style={{alignItems:'center',marginTop:40, width: '100%'}}>
                <Text>No products match your filters</Text>
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={{color:COLORS.primary,marginTop:8}}>Clear filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.background},
  header:{backgroundColor:COLORS.primary,padding:16},
  headerTop:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:12},
  headerTitle:{color:'white',fontSize:18,fontWeight:'bold'},
  searchContainer:{position:'relative'},
  searchInput:{backgroundColor:'white',paddingLeft:36,paddingVertical:8,borderRadius:RADIUS.md},
  searchIcon:{position:'absolute',left:8,top:8},
  filters:{backgroundColor:'white',borderRadius:RADIUS.lg,padding:12,marginBottom:16},
  filtersHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},
  filtersTitle:{marginLeft:4,color:COLORS.primary,fontWeight:'600'},
  clearText:{color:COLORS.primary,fontSize:12},
  filterLabel:{fontSize:12,color:COLORS.textSecondary,marginBottom:4},
  priceButton:{padding:6,borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.sm,marginRight:8},
  priceButtonActive:{borderColor:COLORS.primary,backgroundColor:COLORS.primaryTint},
  priceText:{fontSize:12,color:COLORS.textSecondary},
  priceTextActive:{color:COLORS.primary,fontWeight:'600'},
  ratingContainer:{flexDirection:'row',marginBottom:12},
  ratingButton:{padding:6,borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.sm,marginRight:8},
  ratingButtonActive:{borderColor:COLORS.star,backgroundColor:'#FFFBEB'},
  ratingText:{fontSize:12,color:COLORS.textSecondary},
  ratingTextActive:{color:COLORS.star,fontWeight:'600'},
  sortContainer:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
  productsCount:{color:COLORS.textSecondary,fontSize:12},
  sortButton:{flexDirection:'row',alignItems:'center',padding:8,borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.sm,backgroundColor:'white'},
  sortMenu:{position:'absolute',right:0,top:36,backgroundColor:'white',borderRadius:RADIUS.md,padding:8,...SHADOWS.md,zIndex:10},
  sortOption:{paddingVertical:6,paddingHorizontal:12,borderRadius:RADIUS.sm},
  sortOptionActive:{backgroundColor:COLORS.primaryTint},
  sortOptionText:{color:COLORS.primary},
  sortOptionTextActive:{color:COLORS.primary,fontWeight:'600'},
  productsGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},
  productCard:{backgroundColor:'white',width:'48%',borderRadius:RADIUS.lg,padding:12,marginBottom:12},
  productName:{fontSize:12,fontWeight:'600',marginBottom:4},
  productRating:{flexDirection:'row',alignItems:'center',marginBottom:4},
  productRatingText:{fontSize:12,marginLeft:4},
  productReviews:{fontSize:10,color:COLORS.textSecondary,marginLeft:2},
  productPrice:{color:COLORS.primary,fontWeight:'600',fontSize:12,marginBottom:2},
  productSeller:{fontSize:10,color:COLORS.textSecondary},
});