import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- KẾT NỐI FIREBASE ---
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');

// --- INTERFACES ---
interface Product {
  id: string;
  name: string;
  categoryId: string;
  describe: string;
  image: string;
  priceNum: number;
  promotion: boolean;
  quantity: number;
  rating: string;
  sold: string;
}

interface CartItem extends Product {
  cartQuantity: number;
}

const categories = [
  { id: 'all', name: 'Tất cả', icon: '✨' },
  { id: 'shoes', name: 'Giày', icon: '👟' },
  { id: 'clothes', name: 'Quần áo', icon: '👕' },
  { id: 'audio', name: 'Phụ kiện', icon: '🎧' },
];

const flashSaleProducts = [
  { id: 'f1', name: 'iPhone 15 Pro', price: '26.990.000₫', sold: 78, image: 'https://picsum.photos/200/200?sig=10' },
  { id: 'f2', name: 'MacBook Pro M3', price: '38.990.000₫', sold: 45, image: 'https://picsum.photos/200/200?sig=11' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // 1. Tải dữ liệu Firebase và thông tin User khi lần đầu vào app
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserInfo(),
        loadCart(),
        fetchProductsFromFirebase()
      ]);
    } catch (error) {
      console.error("Lỗi khởi tạo:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Cập nhật giỏ hàng mỗi khi màn hình Home được quay lại (Focus)
  useFocusEffect(
    useCallback(() => {
      const loadCart = async () => {
        try {
          const savedCart = await AsyncStorage.getItem('user_cart');
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          } else {
            setCart([]); // Xử lý khi giỏ hàng bị xóa sạch
          }
        } catch (e) {
          console.error("Lỗi load giỏ hàng:", e);
        }
      };
      loadCart();
    }, [])
  );

  const fetchProductsFromFirebase = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "product"));
      const items: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          name: data.Name || 'Sản phẩm mới',
          categoryId: data.categoryId ? String(data.categoryId).trim().toLowerCase() : 'all',
          describe: data.describe || '',
          image: data.images || 'https://via.placeholder.com/150',
          priceNum: Number(data.price) || 0,
          promotion: data.promotion || false,
          quantity: data.quantity || 0,
          rating: data.rating || '5.0',
          sold: data.sold || '0',
        });
      });
      setProducts(items);
    } catch (error) {
      console.error("🔥 Firestore error:", error);
    }
  };

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('user_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) { console.error(e); }
  };

  // --- HÀM THÊM VÀO GIỎ HÀNG TỐI ƯU ---
  const addToCart = async (product: Product) => {
    try {
      const savedCart = await AsyncStorage.getItem('user_cart');
      let currentCart: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

      const index = currentCart.findIndex(item => item.id === product.id);

      if (index > -1) {
        if (currentCart[index].cartQuantity < product.quantity) {
          currentCart[index].cartQuantity += 1;
        } else {
          Alert.alert("Thông báo", "Số lượng đã đạt giới hạn tồn kho");
          return;
        }
      } else {
        currentCart.push({ ...product, cartQuantity: 1 });
      }

      setCart(currentCart); // Cập nhật ngay lập tức UI tại Home
      await AsyncStorage.setItem('user_cart', JSON.stringify(currentCart));
      Alert.alert("🛒 Thành công", `Đã thêm ${product.name} vào giỏ hàng`);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng");
    }
  };

  const fetchUserInfo = async () => {
    try {
      const idToken = await AsyncStorage.getItem('idToken');
      if (!idToken) {
        router.replace('/(auth)/login');
        return;
      }
      // Lưu ý: Key Firebase nên để trong config hoặc biến môi trường
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCDf0L31c7ZYq2HolzIxfKIsC9BIEUHgBo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );
      const data = await response.json();
      if (data.users && data.users[0]) {
        const u = data.users[0];
        setUser({
          name: u.displayName || u.email.split('@')[0],
          email: u.email
        });
      }
    } catch (error) { console.error('User fetch error:', error); }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      let matchCat = false;
      
      if (selectedCat === 'all') {
        matchCat = true;
      } else if (selectedCat === 'shoes') {
        const shoeGroup = ['shoes', 'sneaker', 'giày', 'thethao', '1'];
        matchCat = shoeGroup.includes(p.categoryId.toLowerCase());
      } else if (selectedCat === 'clothes') {
        const clothesGroup = ['clothes', 'clothing', 'quanao', 'quần áo', 'ao', 'quan', '2'];
        matchCat = clothesGroup.includes(p.categoryId.toLowerCase());
      } else if (selectedCat === 'audio') {
        const accessoryGroup = ['audio', 'accessory', 'phukien', 'phụ kiện', '3'];
        matchCat = accessoryGroup.includes(p.categoryId.toLowerCase());
      } else {
        matchCat = p.categoryId === selectedCat;
      }
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCat, products]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1D4ED8" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D4ED8" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.userName}>{user?.name || 'Khách'} 👋</Text>
            <Text style={styles.greeting}>Hôm nay bạn muốn mua sắm gì nào?</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartIconContainer}>
            <Ionicons name="cart-outline" size={28} color="white" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cart.reduce((sum, item) => sum + item.cartQuantity, 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm sản phẩm nổi bật..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* DANH MỤC */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCat(cat.id)}
                style={[styles.catChip, selectedCat === cat.id ? styles.catChipActive : styles.catChipInactive]}
              >
                <Text style={styles.catIconText}>{cat.icon}</Text>
                <Text style={[styles.catChipName, selectedCat === cat.id ? styles.catTextActive : styles.catTextInactive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FLASH SALE */}
        <View style={styles.flashBox}>
          <View style={styles.flashHeader}>
            <View style={styles.row}>
              <MaterialCommunityIcons name="lightning-bolt" size={22} color="#FDE047" />
              <Text style={styles.flashTitle}>FLASH SALE</Text>
            </View>
            <View style={styles.timer}>
              <Text style={styles.timerText}>02 : 45 : 30</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {flashSaleProducts.map(item => (
              <View key={item.id} style={styles.fProductCard}>
                <Image source={{ uri: item.image }} style={styles.fImg} />
                <Text style={styles.fPrice}>{item.price}</Text>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressFill, { width: `${item.sold}%` }]} />
                  <Text style={styles.progressText}>Đã bán {item.sold}%</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* PRODUCT GRID */}
        <View style={styles.productGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.shopeeCard}
                activeOpacity={0.9}
                onPress={() => {
                  router.push({
                    pathname: "/ProductDetailScreen" as any,
                    params: { id: product.id }
                  });
                }}
              >
                <View style={styles.shopeeImgContainer}>
                  <Image source={{ uri: product.image }} style={styles.shopeeImg} resizeMode="cover" />
                </View>

                <View style={styles.shopeeInfo}>
                  <Text style={styles.shopeeName} numberOfLines={2}>{product.name}</Text>
                  <View style={styles.shopeePriceRow}>
                    <Text style={styles.shopeePriceSymbol}>₫</Text>
                    <Text style={styles.shopeePriceText}>{product.priceNum.toLocaleString('vi-VN')}</Text>
                  </View>
                  <View style={styles.shopeeFooter}>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={10} color="#FFCE3D" />
                      <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.shopeeAddBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    <MaterialCommunityIcons name="cart-plus" size={18} color="#EE4D2D" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

//  ... Styles giữ nguyên từ code của bạn ...
const styles = StyleSheet.create({
  /* ====== LAYOUT CHUNG ====== */
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* ====== HEADER ====== */
  header: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 45,
    paddingBottom: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: '#BFDBFE',
    fontSize: 13,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  /* ====== CART ICON ====== */
  cartIconContainer: {
    position: 'relative',
    padding: 5,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1D4ED8',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  /* ====== SEARCH ====== */
  searchContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    height: 50,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1E293B',
  },

  /* ====== SECTION ====== */
  section: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },

  /* ====== CATEGORY CHIP ====== */
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
  },
  catChipActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  catChipInactive: {
    backgroundColor: 'white',
    borderColor: '#E2E8F0',
  },
  catIconText: {
    marginRight: 8,
    fontSize: 18,
  },
  catChipName: {
    fontSize: 14,
    fontWeight: '600',
  },
  catTextActive: {
    color: 'white',
  },
  catTextInactive: {
    color: '#64748B',
  },

  /* ====== FLASH SALE ====== */
  flashBox: {
    backgroundColor: '#EE4D2D',
    margin: 15,
    borderRadius: 25,
    padding: 18,
  },
  flashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  flashTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  timer: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timerText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },

  /* ====== FLASH PRODUCT ====== */
  fProductCard: {
    backgroundColor: 'white',
    width: 135,
    borderRadius: 20,
    padding: 10,
    marginRight: 15,
  },
  fImg: {
    width: '100%',
    height: 110,
    borderRadius: 15,
    resizeMode: 'cover',
    backgroundColor: '#F1F5F9',
  },
  fPrice: {
    color: '#EE4D2D',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },

  progressContainer: {
    height: 16,
    backgroundColor: '#FFBDAD',
    borderRadius: 20,
    marginTop: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#EE4D2D',
    borderRadius: 20,
  },
  progressText: {
    fontSize: 9,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },

  /* ====== PRODUCT GRID ====== */
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 10,
  },

  /* ====== SHOPEE CARD ====== */
  shopeeCard: {
    width: (width / 2) - 18,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  shopeeImgContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F1F5F9',
  },
  shopeeImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,

    
  },
  shopeeInfo: {
    padding: 12,
  },
  shopeeName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 18,
    height: 36,
    overflow: 'hidden',
    marginBottom: 8,
  },
  shopeePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  shopeePriceSymbol: {
    fontSize: 12,
    color: '#EE4D2D',
    fontWeight: 'bold',
  },
  shopeePriceText: {
    fontSize: 17,
    color: '#EE4D2D',
    fontWeight: 'bold',
  },
  shopeeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    marginLeft: 3,
    color: '#64748B',
  },
  shopeeAddBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FFF5F1',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EE4D2D',
  },

  /* ====== EMPTY ====== */
  emptyContainer: {
    width: width - 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});