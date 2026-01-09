// import React, { useEffect, useState } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   SafeAreaView,
//   Dimensions,
//   Platform,
//   StatusBar,
//   ActivityIndicator,
// } from 'react-native';
// import {
//   Ionicons,
//   AntDesign,
//   MaterialCommunityIcons,
//   MaterialIcons,
// } from '@expo/vector-icons';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { db } from '../app/firebase/firebaseConfig';
// import { doc, getDoc } from 'firebase/firestore';

// const { width } = Dimensions.get('window');

// export default function ProductDetailScreen() {
//   const router = useRouter();
//   const { id } = useLocalSearchParams<{ id?: string }>();

//   const [product, setProduct] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [isLiked, setIsLiked] = useState(false);

//   useEffect(() => {
//     if (!id) {
//       setLoading(false);
//       return;
//     }
//     fetchProductDetail();
//   }, [id]);

//   // ================= FETCH PRODUCT =================
//   const fetchProductDetail = async () => {
//     try {
//       const docRef = doc(db, 'product', id as string);
//       const docSnap = await getDoc(docRef);

//       if (!docSnap.exists()) {
//         setProduct(null);
//         return;
//       }

//       const data = docSnap.data();
//       const price = Number(data.price) || 0;

//       setProduct({
//         id: docSnap.id,

//         // ===== DATA CHUẨN HÓA =====
//         name: data.name || data.Name || 'Sản phẩm mới',
//         categoryId: data.categoryId ?? null,

//         description:
//           data.description || data.describe || 'Không có mô tả',

//         image: Array.isArray(data.images)
//           ? data.images[0]
//           : data.images || 'https://via.placeholder.com/300',

//         price,
//         originalPrice:
//           Number(data.originalPrice) || Math.round(price * 1.2),

//         stock: Number(data.quantity || data.stock) || 0,
//         sold: Number(data.sold) || 0,
//         rating: data.rating || '5.0',

//         promotion: data.promotion || false,
//       });
//     } catch (error) {
//       console.error('❌ Lỗi lấy chi tiết sản phẩm:', error);
//       setProduct(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatPrice = (price: number) =>
//     price.toLocaleString('vi-VN') + '₫';

//   // ================= RENDER =================
//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );
//   }

//   if (!product) {
//     return (
//       <View style={styles.center}>
//         <Text>Không tìm thấy sản phẩm</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={styles.iconButton}
//         >
//           <Ionicons name="arrow-back" size={24} />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle} numberOfLines={1}>
//           Chi tiết sản phẩm
//         </Text>

//         <View style={styles.headerRight}>
//           <TouchableOpacity style={styles.iconButton}>
//             <Ionicons
//               name="share-social-outline"
//               size={22}
//             />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => setIsLiked(!isLiked)}
//             style={styles.iconButton}
//           >
//             <Ionicons
//               name={isLiked ? 'heart' : 'heart-outline'}
//               size={22}
//               color={isLiked ? '#ef4444' : '#000'}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {/* IMAGE */}
//         <View style={styles.imageSection}>
//           <Image
//             source={{ uri: product.image }}
//             style={styles.mainImage}
//           />
//         </View>

//         {/* INFO */}
//         <View style={styles.infoSection}>
//           <Text style={styles.productName}>{product.name}</Text>

//           <View style={styles.statsRow}>
//             <AntDesign name="star" size={16} color="#facc15" />
//             <Text style={styles.statText}>{product.rating}</Text>
//             <Text style={styles.divider}>|</Text>
//             <Text style={styles.statText}>
//               {product.sold} đã bán
//             </Text>
//             <Text style={styles.divider}>|</Text>
//             <Text style={styles.statText}>
//               Kho: {product.stock}
//             </Text>
//           </View>

//           <View style={styles.priceRow}>
//             <Text style={styles.currentPrice}>
//               {formatPrice(product.price)}
//             </Text>
//             <Text style={styles.oldPrice}>
//               {formatPrice(product.originalPrice)}
//             </Text>
//           </View>

//           <Text style={styles.sectionLabel}>Mô tả sản phẩm</Text>
//           <Text style={styles.descriptionText}>
//             {product.description}
//           </Text>

//           {/* QUANTITY */}
//           <View style={styles.quantityRow}>
//             <Text style={styles.sectionLabel}>Số lượng:</Text>

//             <View style={styles.counter}>
//               <TouchableOpacity
//                 onPress={() =>
//                   setQuantity(q => Math.max(1, q - 1))
//                 }
//                 style={styles.counterBtn}
//               >
//                 <AntDesign name="minus" size={18} />
//               </TouchableOpacity>

//               <Text style={styles.quantityText}>{quantity}</Text>

//               <TouchableOpacity
//                 disabled={product.stock === 0}
//                 onPress={() =>
//                   setQuantity(q =>
//                     Math.min(product.stock, q + 1)
//                   )
//                 }
//                 style={[
//                   styles.counterBtn,
//                   { backgroundColor: '#2563eb' },
//                 ]}
//               >
//                 <AntDesign name="plus" size={18} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* BENEFIT */}
//         <View style={styles.whiteSection}>
//           <Text style={styles.subHeader}>Ưu đãi & Bảo hành</Text>

//           <View style={styles.benefitBox}>
//             <MaterialCommunityIcons
//               name="truck-delivery-outline"
//               size={24}
//               color="#2563eb"
//             />
//             <Text style={styles.benefitText}>
//               Miễn phí vận chuyển toàn quốc
//             </Text>
//           </View>

//           <View style={styles.benefitBox}>
//             <MaterialIcons
//               name="verified-user"
//               size={24}
//               color="#16a34a"
//             />
//             <Text style={styles.benefitText}>
//               Bảo hành chính hãng 12 tháng
//             </Text>
//           </View>
//         </View>
//       </ScrollView>

//       {/* BOTTOM BAR */}
//       <View style={styles.bottomBar}>
//         <TouchableOpacity style={styles.addToCartBtn}>
//           <MaterialCommunityIcons
//             name="cart-plus"
//             size={22}
//             color="#2563eb"
//           />
//           <Text style={styles.addToCartText}>Giỏ hàng</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.buyNowBtn}>
//           <Text style={styles.buyNowText}>Mua ngay</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f9fafb' },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f3f4f6',
//     paddingTop: Platform.OS === 'ios' ? 12 : 40,
//   },

//   headerTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#111827',
//     textAlign: 'center',
//     flex: 1,
//   },

//   headerRight: { flexDirection: 'row', gap: 8 },

//   iconButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#f3f4f6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   scrollContent: { paddingBottom: 130 },

//   imageSection: {
//     backgroundColor: '#fff',
//     padding: 16,
//     alignItems: 'center',
//   },

//   mainImage: {
//     width: width - 32,
//     height: width - 32,
//     borderRadius: 20,
//     resizeMode: 'cover',
//   },

//   infoSection: {
//     backgroundColor: '#fff',
//     marginTop: 8,
//     padding: 16,
//   },

//   productName: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#111827',
//     marginBottom: 8,
//   },

//   statsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },

//   statText: {
//     fontSize: 13,
//     color: '#6b7280',
//     marginLeft: 4,
//   },

//   divider: { color: '#e5e7eb', marginHorizontal: 8 },

//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//     marginBottom: 20,
//   },

//   currentPrice: {
//     fontSize: 24,
//     fontWeight: '900',
//     color: '#2563eb',
//     marginRight: 8,
//   },

//   oldPrice: {
//     fontSize: 14,
//     color: '#9ca3af',
//     textDecorationLine: 'line-through',
//   },

//   sectionLabel: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#374151',
//     marginBottom: 12,
//   },

//   descriptionText: {
//     fontSize: 14,
//     color: '#6b7280',
//     lineHeight: 22,
//     marginBottom: 20,
//   },

//   quantityRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   counter: { flexDirection: 'row', alignItems: 'center', gap: 12 },

//   counterBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#f3f4f6',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   quantityText: {
//     fontSize: 16,
//     fontWeight: '700',
//     minWidth: 24,
//     textAlign: 'center',
//   },

//   whiteSection: {
//     backgroundColor: '#fff',
//     marginTop: 8,
//     padding: 16,
//   },

//   subHeader: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: '#111827',
//     marginBottom: 12,
//   },

//   benefitBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f9fafb',
//     padding: 12,
//     borderRadius: 14,
//     marginBottom: 10,
//   },

//   benefitText: {
//     marginLeft: 10,
//     fontSize: 14,
//     color: '#4b5563',
//   },

//   bottomBar: {
//     position: 'absolute',
//     bottom: 0,
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     padding: 16,
//     paddingBottom: Platform.OS === 'ios' ? 28 : 16,
//     borderTopWidth: 1,
//     borderTopColor: '#f3f4f6',
//     width: '100%',
//     gap: 12,
//   },

//   addToCartBtn: {
//     flex: 0.4,
//     height: 50,
//     backgroundColor: '#eff6ff',
//     borderRadius: 14,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 6,
//   },

//   addToCartText: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: '#2563eb',
//   },

//   buyNowBtn: {
//     flex: 0.6,
//     height: 50,
//     backgroundColor: '#2563eb',
//     borderRadius: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   buyNowText: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: '#fff',
//   },
// });

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

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchProductDetail();
  }, [id]);

  // ================= FETCH PRODUCT =================
  const fetchProductDetail = async () => {
    try {
      const docRef = doc(db, 'product', id as string);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setProduct(null);
        return;
      }

      const data = docSnap.data();
      const price = Number(data.price) || 0;

      setProduct({
        id: docSnap.id,
        name: data.name || data.Name || 'Sản phẩm mới',
        description: data.description || data.describe || 'Không có mô tả',
        image: Array.isArray(data.images) ? data.images[0] : data.images || 'https://via.placeholder.com/300',
        price,
        originalPrice: Number(data.originalPrice) || Math.round(price * 1.2),
        stock: Number(data.quantity || data.stock) || 0,
        sold: Number(data.sold) || 0,
        rating: data.rating || '5.0',
      });
    } catch (error) {
      console.error('❌ Lỗi lấy chi tiết sản phẩm:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIC XỬ LÝ NÚT BẤM =================

  // 1. Xử lý Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('user_cart');
      let cart = cartData ? JSON.parse(cartData) : [];

      const existingIndex = cart.findIndex((item: any) => item.id === product.id);

      if (existingIndex > -1) {
        cart[existingIndex].cartQuantity += quantity;
      } else {
        cart.push({
          ...product,
          priceNum: product.price, // Dùng priceNum để Checkout tính tiền
          cartQuantity: quantity,
        });
      }

      await AsyncStorage.setItem('user_cart', JSON.stringify(cart));
      Alert.alert("Thành công", "Đã thêm sản phẩm vào giỏ hàng!");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng.");
    }
  };

  // 2. Xử lý Mua ngay (Chuyển thẳng tới Checkout)
  const handleBuyNow = () => {
    const itemToBuy = [{
      ...product,
      priceNum: product.price,
      cartQuantity: quantity,
    }];

    router.push({
      pathname: "/CheckoutScreen" as any,
      params: {
        cartData: JSON.stringify(itemToBuy) // Gửi mảng chứa 1 sản phẩm duy nhất
      }
    });
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + '₫';

  // ================= RENDER =================
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  if (!product) return <View style={styles.center}><Text>Không tìm thấy sản phẩm</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết sản phẩm</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.iconButton}>
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#ef4444' : '#000'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageSection}>
          <Image source={{ uri: product.image }} style={styles.mainImage} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.statsRow}>
            <AntDesign name="star" size={16} color="#facc15" />
            <Text style={styles.statText}>{product.rating} | {product.sold} đã bán | Kho: {product.stock}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{formatPrice(product.price)}</Text>
            <Text style={styles.oldPrice}>{formatPrice(product.originalPrice)}</Text>
          </View>

          <Text style={styles.sectionLabel}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          {/* QUANTITY */}
          <View style={styles.quantityRow}>
            <Text style={styles.sectionLabel}>Số lượng:</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.counterBtn}>
                <AntDesign name="minus" size={18} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                onPress={() => setQuantity(q => Math.min(product.stock, q + 1))} 
                style={[styles.counterBtn, { backgroundColor: '#2563eb' }]}
              >
                <AntDesign name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <MaterialCommunityIcons name="cart-plus" size={22} color="#2563eb" />
          <Text style={styles.addToCartText}>Giỏ hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
    paddingTop: Platform.OS === 'ios' ? 12 : 40,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827', textAlign: 'center', flex: 1 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 130 },
  imageSection: { backgroundColor: '#fff', padding: 16, alignItems: 'center' },
  mainImage: { width: width - 32, height: width - 32, borderRadius: 20, resizeMode: 'cover' },
  infoSection: { backgroundColor: '#fff', marginTop: 8, padding: 16 },
  productName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statText: { fontSize: 13, color: '#6b7280', marginLeft: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  currentPrice: { fontSize: 24, fontWeight: '900', color: '#2563eb', marginRight: 8 },
  oldPrice: { fontSize: 14, color: '#9ca3af', textDecorationLine: 'line-through' },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  descriptionText: { fontSize: 14, color: '#6b7280', lineHeight: 22, marginBottom: 20 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  counterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  quantityText: { fontSize: 16, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  bottomBar: {
    position: 'absolute', bottom: 0, flexDirection: 'row', backgroundColor: '#fff',
    padding: 16, paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1, borderTopColor: '#f3f4f6', width: '100%', gap: 12,
  },
  addToCartBtn: { flex: 0.4, height: 50, backgroundColor: '#eff6ff', borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  addToCartText: { fontSize: 14, fontWeight: '800', color: '#2563eb' },
  buyNowBtn: { flex: 0.6, height: 50, backgroundColor: '#2563eb', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  buyNowText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});