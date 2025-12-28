import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '../components/type/product';

interface CategoriesProps {
  products: Product[];
  onBack: () => void;
  onProductClick: (product: Product) => void;
}

const categories = [
  { id: 'smartphones', name: 'Smartphones', icon: '📱' },
  { id: 'audio', name: 'Audio', icon: '🎧' },
  { id: 'computers', name: 'Computers', icon: '💻' },
  { id: 'cameras', name: 'Cameras', icon: '📷' },
  { id: 'wearables', name: 'Wearables', icon: '⌚' },
  { id: 'tablets', name: 'Tablets', icon: '📱' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
  { id: 'accessories', name: 'Accessories', icon: '🔌' },
];

export default function Categories({ products, onBack, onProductClick }: CategoriesProps) {
  // Count products per category
  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    count: products.filter(p => p.category.toLowerCase() === cat.id).length
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Categories Grid */}
        <View style={styles.grid}>
          {categoriesWithCount.map(category => (
            <TouchableOpacity key={category.id} style={styles.categoryItem}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.count} items</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Products */}
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Popular Products</Text>
          {products.slice(0, 5).map(product => (
            <TouchableOpacity
              key={product.id}
              onPress={() => onProductClick(product)}
              style={styles.productItem}
            >
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productPrice}>${product.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: '#111827' },
  content: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryItem: { width: '48%', aspectRatio: 1, backgroundColor: '#F3F4F6', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  categoryIcon: { fontSize: 36, marginBottom: 8 },
  categoryName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  categoryCount: { fontSize: 12, color: '#6B7280' },
  popularSection: { marginTop: 24 },
  popularTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  productItem: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' },
  productImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  productCategory: { fontSize: 12, color: '#6B7280', marginVertical: 2 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#2563EB' },
});
