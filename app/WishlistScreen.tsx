import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Nếu bạn sử dụng React Native Reanimated hoặc Animatable có thể thêm hiệu ứng sau
// Ở đây dùng Animated gốc hoặc chỉ logic UI cơ bản

const { width } = Dimensions.get('window');

const initialWishlist = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    price: 29990000,
    originalPrice: 34990000,
    image: 'https://images.unsplash.com/photo-1758411898502-013b0cd3421c?q=80&w=500',
    rating: 4.9,
    inStock: true,
  },
  {
    id: 2,
    name: 'MacBook Air M3 13" 2024',
    price: 28990000,
    originalPrice: 32990000,
    image: 'https://images.unsplash.com/photo-1702865053708-be5f974d5e05?q=80&w=500',
    rating: 4.8,
    inStock: true,
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5 Wireless',
    price: 8990000,
    originalPrice: 10990000,
    image: 'https://images.unsplash.com/photo-1748698361079-fd70b999be1a?q=80&w=500',
    rating: 4.7,
    inStock: false,
  },
];

export default function WishlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState(initialWishlist);

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#db2777" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.iconButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Yêu thích</Text>
              <Text style={styles.headerSubtitle}>{items.length} sản phẩm</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-social-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={64} color="#db2777" />
            </View>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
            <Text style={styles.emptyDesc}>
              Thêm sản phẩm vào danh sách yêu thích để mua sau
            </Text>
            <TouchableOpacity 
              style={styles.exploreBtn}
              onPress={() => router.push('/')}
            >
              <Text style={styles.exploreBtnText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {items.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardContent}>
                  {/* Image Section */}
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                    {!item.inStock && (
                      <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>Hết hàng</Text>
                      </View>
                    )}
                  </View>

                  {/* Info Section */}
                  <View style={styles.infoContainer}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    
                    <View style={styles.ratingContainer}>
                      <FontAwesome name="star" size={14} color="#facc15" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>

                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{formatPrice(item.price)}</Text>
                      <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity 
                        disabled={!item.inStock}
                        style={[
                          styles.cartBtn, 
                          !item.inStock && { backgroundColor: '#e2e8f0' }
                        ]}
                        onPress={() => router.push('/cart' as any)}
                      >
                        <Ionicons 
                          name="cart-outline" 
                          size={18} 
                          color={item.inStock ? "white" : "#94a3b8"} 
                        />
                        <Text style={[
                          styles.cartBtnText,
                          !item.inStock && { color: '#94a3b8' }
                        ]}>
                          {item.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.deleteBtn}
                        onPress={() => removeItem(item.id)}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {/* Bottom Action */}
            <TouchableOpacity style={styles.addAllBtn}>
              <Text style={styles.addAllBtnText}>Thêm tất cả vào giỏ hàng</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#db2777',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#db2777',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 50,
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#fbcfe8', fontSize: 13 },
  
  scrollContent: { padding: 20 },
  
  // Card Styles
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginBottom: 16,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: { flexDirection: 'row', gap: 12 },
  imageContainer: { position: 'relative' },
  image: { width: 100, height: 100, borderRadius: 16 },
  outOfStockBadge: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  
  infoContainer: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingText: { fontSize: 13, color: '#4b5563' },
  priceContainer: { marginBottom: 12 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#2563eb' },
  originalPrice: { fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  cartBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cartBtnText: { color: 'white', fontSize: 12, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyIconCircle: {
    width: 120,
    height: 120,
    backgroundColor: '#fbcfe8',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 30 },
  exploreBtn: {
    backgroundColor: '#db2777',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 50,
  },
  exploreBtnText: { color: 'white', fontWeight: 'bold' },

  addAllBtn: {
    backgroundColor: '#db2777',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    elevation: 6,
    shadowColor: '#db2777',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  addAllBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});