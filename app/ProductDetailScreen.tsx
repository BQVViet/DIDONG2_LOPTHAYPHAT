import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../app/firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Thêm thư viện này để xử lý vùng an toàn chuẩn xác nhất
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const insets = useSafeAreaInsets(); // Hook lấy thông tin vùng an toàn
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  /* ================= FETCH PRODUCT ================= */
  const fetchProduct = async () => {
    try {
      const ref = doc(db, 'product', id as string);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const data = snap.data();
      const price = Number(data.price) || 0;

      setProduct({
        id: snap.id,
        name: data.name || 'Sản phẩm mới',
        description: data.description || data.describe || 'Không có mô tả',
        image: Array.isArray(data.images) ? data.images[0] : data.images,
        price,
        originalPrice: Number(data.originalPrice) || Math.round(price * 1.2),
        stock: Number(data.stock || data.quantity) || 0,
        sold: Number(data.sold) || 0,
        rating: data.rating || '5.0',
        sizes: Array.isArray(data.sizes) ? data.sizes : [],
        colors: Array.isArray(data.colors)
          ? data.colors
          : Array.isArray(data.Colors)
            ? data.Colors
            : [],
      });
    } catch (err) {
      console.log('Lỗi:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= VALIDATE ================= */
  const validateSelect = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      Alert.alert('Vui lòng chọn size');
      return false;
    }

    if (product.colors.length > 0 && !selectedColor) {
      Alert.alert('Vui lòng chọn màu');
      return false;
    }

    return true;
  };


  /* ================= ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!validateSelect()) return;

    const cartData = await AsyncStorage.getItem('user_cart');
    const cart = cartData ? JSON.parse(cartData) : [];

    cart.push({
      ...product,
      sizeSelected: selectedSize,
      colorSelected: selectedColor,
      cartQuantity: quantity,
    });

    await AsyncStorage.setItem('user_cart', JSON.stringify(cart));

    Alert.alert('🛒 Đã thêm vào giỏ', '', [
      { text: 'Tiếp tục mua', style: 'cancel' },
      { text: 'Xem giỏ hàng', onPress: () => router.push('/cart') },
    ]);
  };

  /* ================= BUY NOW ================= */
  const handleBuyNow = () => {
    if (!validateSelect()) return;

    router.push({
      pathname: '/CheckoutScreen' as any,
      params: {
        cartData: JSON.stringify([
          {
            ...product,
            sizeSelected: selectedSize,
            colorSelected: selectedColor,
            cartQuantity: quantity,
          },
        ]),
      },
    });
  };

  const formatPrice = (p: number) => p.toLocaleString('vi-VN') + '₫';

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ee4d2d" />
      </View>
    );

  if (!product)
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy sản phẩm</Text>
      </View>
    );

  /* ================= RENDER ================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>

        <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.iconBtn}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? '#ee4d2d' : '#111'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        {/* IMAGE */}
        <View style={styles.imageBox}>
          <Image source={{ uri: product.image }} style={styles.image} />
        </View>

        {/* INFO */}
        <View style={styles.infoBox}>
          <Text style={styles.name}>{product.name}</Text>

          <Text style={styles.stat}>
            ⭐ {product.rating} | Đã bán {product.sold} | Kho {product.stock}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.oldPrice}>{formatPrice(product.originalPrice)}</Text>
          </View>

          {/* SIZE */}
          {product.sizes && product.sizes.length > 0 && (
            <>
              <Text style={styles.label}>Size</Text>
              <View style={styles.optionWrap}>
                {product.sizes.map((s: string) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSelectedSize(s)}
                    style={[styles.optionBtn, selectedSize === s && styles.optionActive]}
                  >
                    <Text style={[styles.optionText, selectedSize === s && styles.optionTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* COLOR */}
          {product.colors && product.colors.length > 0 && (
            <>
              <Text style={styles.label}>Màu sắc</Text>
              <View style={styles.colorWrap}>
                {product.colors.map((c: string) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    style={[styles.colorItem, selectedColor === c && styles.colorActive]}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: '#e5e7eb' }, selectedColor === c && { borderColor: '#ee4d2d' }]} />
                    <Text style={[styles.colorText, selectedColor === c && { color: '#ee4d2d', fontWeight: 'bold' }]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* QUANTITY */}
          <Text style={styles.label}>Số lượng</Text>
          <View style={styles.counter}>
            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.counterBtn}>
              <AntDesign name="minus" size={14} />
            </TouchableOpacity>

            <Text style={styles.qty}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={[styles.counterBtn, styles.counterActive]}>
              <AntDesign name="plus" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* DESCRIPTION */}
          <Text style={styles.label}>Mô tả</Text>
          <Text style={styles.desc}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* BOTTOM - ĐÃ FIX LỖI DÍNH THANH ĐIỀU HƯỚNG */}
      <View style={[
          styles.bottom, 
          { 
            // Tự động cộng thêm khoảng trống an toàn từ hệ thống
            paddingBottom: Math.max(insets.bottom, 16),
            height: Platform.OS === 'ios' ? 70 + insets.bottom : 85 + insets.bottom 
          }
        ]}>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <MaterialCommunityIcons name="cart-plus" size={20} color="#ee4d2d" />
          <Text style={styles.cartText}>Giỏ hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
          <Text style={styles.buyText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>

  );
}

/* ================= STYLE (SHOPEE) ================= */
//   container: { flex: 1, backgroundColor: '#f5f5f5' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 14,
//     paddingTop: Platform.OS === 'ios' ? 12 : 42,
//     paddingBottom: 12,
//     backgroundColor: '#fff',
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#e5e7eb',
//   },
//   headerTitle: { fontSize: 16, fontWeight: '700' },
//   iconBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#f3f4f6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   imageBox: { backgroundColor: '#fff', padding: 12 },
//   image: { width: width - 24, height: width - 24, borderRadius: 12 },

//   infoBox: { backgroundColor: '#fff', marginTop: 8, padding: 14 },
//   name: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
//   stat: { fontSize: 12, color: '#6b7280', marginBottom: 10 },

//   priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 18 },
//   price: { fontSize: 24, fontWeight: '800', color: '#ee4d2d' },
//   oldPrice: { marginLeft: 8, fontSize: 13, color: '#9ca3af', textDecorationLine: 'line-through' },

//   label: { fontSize: 14, fontWeight: '700', marginBottom: 10 },

//   optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
//   optionBtn: { minWidth: 48, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#e5e7eb' },
//   optionActive: { borderColor: '#ee4d2d', backgroundColor: '#fff7ed' },
//   optionText: { fontSize: 13, fontWeight: '600' },
//   optionTextActive: { color: '#ee4d2d' },

//   colorWrap: { flexDirection: 'row', gap: 14, marginBottom: 18 },
//   colorItem: { alignItems: 'center' },
//   colorActive: { transform: [{ scale: 1.1 }] },
//   colorCircle: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#d1d5db' },
//   colorText: { fontSize: 11, marginTop: 4 },

//   counter: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
//   counterBtn: { width: 34, height: 34, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center' },
//   counterActive: { backgroundColor: '#ee4d2d', borderColor: '#ee4d2d' },
//   qty: { minWidth: 40, textAlign: 'center', fontSize: 15, fontWeight: '700' },

//   desc: { fontSize: 13, color: '#4b5563', lineHeight: 20 },

//   bottom: {
//     // position: 'absolute',
  
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 0.5,
    
//     borderTopColor: '#e5e7eb',
//     width: '100%',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: 10,
//     // Shadow cho Android và iOS
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 25, 
//   },
//   cartBtn: {
//     flex: 0.4,
//     height: 48,
//     borderRadius: 8,
//     borderWidth: 1.5,
//     borderColor: '#ee4d2d',
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     flexDirection: 'row',
//     gap: 8,
//     marginRight: 12,
//   },
//   cartText: { fontSize: 14, fontWeight: '700', color: '#ee4d2d' },

//   buyBtn: {
//     flex: 0.6,
//     height: 48,
//     borderRadius: 8,
//     backgroundColor: '#ee4d2d',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buyText: { fontSize: 16, fontWeight: '800', color: '#fff' },
// });
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ================= HEADER ================= */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 12 : 42,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ================= IMAGE ================= */
  imageBox: {
    backgroundColor: '#fff',
    padding: 12,
  },
  image: {
    width: width - 24,
    height: width - 24,
    borderRadius: 12,
  },

  /* ================= INFO ================= */
  infoBox: {
    backgroundColor: '#fff',
    marginTop: 8,
    padding: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  stat: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ee4d2d',
  },
  oldPrice: {
    marginLeft: 8,
    fontSize: 13,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },

  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  optionBtn: {
    minWidth: 48,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  optionActive: {
    borderColor: '#ee4d2d',
    backgroundColor: '#fff7ed',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#ee4d2d',
  },

  colorWrap: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  colorItem: {
    alignItems: 'center',
  },
  colorActive: {
    transform: [{ scale: 1.08 }],
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  colorText: {
    fontSize: 11,
    marginTop: 4,
  },

  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterActive: {
    backgroundColor: '#ee4d2d',
    borderColor: '#ee4d2d',
  },
  qty: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
  },

  desc: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
  },

  /* ================= BOTTOM BAR ================= */
  bottom: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',

    width: '100%',
    paddingHorizontal: 18,
    // paddingVertical: 12,

    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',

    // Shadow nhẹ, không gây hở cuối
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 2  },
    // shadowOpacity: 0,
    // shadowRadius: 0,
    // elevation: 0,
  },

  cartBtn: {
    flex: 0.4,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ee4d2d',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginRight: 12,
  },
  cartText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ee4d2d',
  },

  buyBtn: {
    flex: 0.6,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#ee4d2d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});
