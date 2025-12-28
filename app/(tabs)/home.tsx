import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// --- Dữ liệu danh mục ---
const categories = [
  { id: 'all', name: 'Tất cả', icon: '✨', color: '#64748B' },
  { id: 'phone', name: 'Điện thoại', icon: '📱', color: '#3B82F6' },
  { id: 'laptop', name: 'Laptop', icon: '💻', color: '#A855F7' },
  { id: 'audio', name: 'Tai nghe', icon: '🎧', color: '#EC4899' },
];

// --- Dữ liệu Flash Sale (Bổ sung để không bị lỗi undefined) ---
const flashSaleProducts = [
  { id: 'f1', name: 'iPhone 15 Pro', price: '26.990.000đ', sold: 78, image: 'https://picsum.photos/200/200' },
  { id: 'f2', name: 'MacBook Pro', price: '38.990.000đ', sold: 45, image: 'https://picsum.photos/201/201' },
];

// --- Dữ liệu sản phẩm chính ---
const productsData = [
  { id: 1, category: 'phone', name: 'iPhone 15 Pro Max 256GB', price: '29.990.000đ', priceNum: 29990000, originalPrice: '34.990.000đ', rating: '4.9', sold: '1.2k', badge: 'HOT', badgeColor: '#EF4444' },
  { id: 2, category: 'laptop', name: 'MacBook Air M3 13 inch 2024', price: '27.490.000đ', priceNum: 27490000, originalPrice: '32.990.000đ', rating: '4.8', sold: '856', badge: 'NEW', badgeColor: '#10B981' },
  { id: 3, category: 'audio', name: 'Sony WH-1000XM5 Chống ồn', price: '6.590.000đ', priceNum: 6590000, originalPrice: '8.500.000đ', rating: '4.7', sold: '432', badge: 'SALE', badgeColor: '#F59E0B' },
  { id: 4, category: 'phone', name: 'Apple Watch Series 9 GPS', price: '9.890.000đ', priceNum: 9890000, originalPrice: '11.200.000đ', rating: '5.0', sold: '98', badge: 'TREND', badgeColor: '#8B5CF6' },
  { id: 5, category: 'phone', name: 'Samsung Galaxy S24 Ultra', price: '25.990.000đ', priceNum: 25990000, originalPrice: '30.000.000đ', rating: '4.9', sold: '500', badge: 'HOT', badgeColor: '#EF4444' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [likedProducts, setLikedProducts] = useState(new Set());

  // --- Logic Lọc Sản Phẩm ---
  const filteredProducts = useMemo(() => {
    return productsData.filter(product => {
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCat === 'all' || product.category === selectedCat;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCat]);

  // Sửa lỗi cú pháp: Thêm kiểu dữ liệu number cho id
  const toggleLike = (id: number) => {
    const newLiked = new Set(likedProducts);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedProducts(newLiked);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* --- FIXED HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Mua sắm ngay 👋</Text>
            <Text style={styles.userName}>Nguyễn Văn A</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* --- BỘ LỌC DANH MỤC --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catList}>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat.id} 
                onPress={() => setSelectedCat(cat.id)}
                style={[
                  styles.catChip, 
                  selectedCat === cat.id ? { backgroundColor: '#1D4ED8' } : { backgroundColor: 'white' }
                ]}
              >
                <Text style={styles.catIconText}>{cat.icon}</Text>
                <Text style={[
                  styles.catChipName, 
                  selectedCat === cat.id ? { color: 'white' } : { color: '#1E293B' }
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- FLASH SALE --- */}
        <View style={styles.flashBox}>
          <View style={styles.flashHeader}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FDE047" />
              <Text style={styles.flashTitle}>Flash Sale</Text>
            </View>
            <View style={styles.timer}>
              <Ionicons name="time-outline" size={16} color="white" />
              <Text style={styles.timerText}>02:45:30</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {flashSaleProducts.map(item => (
              <View key={item.id} style={styles.fProductCard}>
                <Image source={{ uri: item.image }} style={styles.fImg} />
                <Text style={styles.fName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.fPrice}>{item.price}</Text>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressFill, { width: `${item.sold}%` }]} />
                  <Text style={styles.progressText}>Đã bán {item.sold}%</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* --- DANH SÁCH SẢN PHẨM --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Kết quả cho "${searchQuery}"` : 'Sản phẩm dành cho bạn'}
            </Text>
            <Text style={styles.countText}>{filteredProducts.length} sản phẩm</Text>
          </View>
          
          {filteredProducts.length > 0 ? (
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <TouchableOpacity key={product.id} style={styles.pCard}>
                  <View style={styles.pImageContainer}>
                    <Image source={{ uri: `https://picsum.photos/200/20${product.id}` }} style={styles.pImg} />
                    <View style={[styles.pBadge, { backgroundColor: product.badgeColor }]}>
                      <Text style={styles.pBadgeText}>{product.badge}</Text>
                    </View>
                    <TouchableOpacity style={styles.pLikeBtn} onPress={() => toggleLike(product.id)}>
                      <Ionicons 
                        name={likedProducts.has(product.id) ? "heart" : "heart-outline"} 
                        size={20} 
                        color={likedProducts.has(product.id) ? "#EF4444" : "#64748B"} 
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pInfo}>
                    <Text style={styles.pName} numberOfLines={2}>{product.name}</Text>
                    <View style={styles.pRatingRow}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.pRatingText}>{product.rating} | {product.sold}</Text>
                    </View>
                    <Text style={styles.pPrice}>{product.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Feather name="search" size={50} color="#CBD5E1" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  row: { flexDirection: 'row', alignItems: 'center' },
  header: { 
    backgroundColor: '#1D4ED8', 
    padding: 20, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30, 
    paddingBottom: 25 
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: '#BFDBFE', fontSize: 13 },
  userName: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  notifBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
  searchContainer: { 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    borderRadius: 15,
    height: 50
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B' },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  countText: { fontSize: 13, color: '#64748B' },
  catList: { flexDirection: 'row', marginTop: 10 },
  catChip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  catIconText: { marginRight: 6 },
  catChipName: { fontWeight: '600', fontSize: 14 },
  flashBox: { backgroundColor: '#FF4D00', margin: 20, borderRadius: 30, padding: 20 },
  flashHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  flashTitle: { color: 'white', fontSize: 20, fontWeight: '900', marginLeft: 5 },
  timer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timerText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
  fProductCard: { backgroundColor: 'white', width: 140, borderRadius: 22, padding: 10, marginRight: 15 },
  fImg: { width: '100%', height: 100, borderRadius: 15 },
  fName: { fontSize: 13, fontWeight: 'bold', marginTop: 8 },
  fPrice: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
  progressContainer: { height: 14, backgroundColor: '#FEE2E2', borderRadius: 10, marginTop: 8, justifyContent: 'center', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#F97316', position: 'absolute' },
  progressText: { fontSize: 9, textAlign: 'center', fontWeight: 'bold', color: '#991B1B' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  pCard: { 
    width: (width - 55) / 2, 
    backgroundColor: 'white', 
    borderRadius: 20, 
    marginBottom: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    overflow: 'hidden'
  },
  pImageContainer: { width: '100%', height: 160 },
  pImg: { width: '100%', height: '100%' },
  pBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  pLikeBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'white', padding: 6, borderRadius: 15, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  pInfo: { padding: 12 },
  pName: { fontSize: 13, fontWeight: '500', color: '#334155', height: 36 },
  pRatingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  pRatingText: { fontSize: 11, color: '#64748B', marginLeft: 4 },
  pPrice: { fontSize: 15, fontWeight: 'bold', color: '#1D4ED8' },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyText: { marginTop: 10, color: '#94A3B8', fontSize: 16 }
});