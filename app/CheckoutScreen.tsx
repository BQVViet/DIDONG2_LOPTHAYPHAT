import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  Image, StatusBar, Dimensions, Animated, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../app/firebase/firebaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [buyItems, setBuyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showSuccess, setShowSuccess] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;


  const saveOrderToAPI = async (order: any) => {
    const res = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCDf0L31c7ZYq2HolzIxfKIsC9BIEUHgBo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    if (!res.ok) {
      throw new Error("API error");
    }
  };

  // --- ĐỊA CHỈ ---
  const displayAddress = {
    fullName: params.selectedName || 'Nguyễn Văn A',
    phone: params.selectedPhone || '0912 345 678',
    address: params.selectedAddress || '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  };

  // --- LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        let rawData = (params.cartData as string) || await AsyncStorage.getItem('temp_checkout_items') || "[]";
        if (params.cartData) await AsyncStorage.setItem('temp_checkout_items', rawData);

        const parsedData = JSON.parse(rawData);
        // Đảm bảo cartQuantity và giá luôn là số
        const standardizedData = parsedData.map((item: any) => ({
          ...item,
          finalPrice: Number(item.priceNum || item.price || 0),
          finalQty: Number(item.cartQuantity || 1)
        }));

        setBuyItems(standardizedData);
      } catch (error) {
        console.error("Lỗi load Checkout:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.cartData]);

  const safeFormatPrice = (price: any) => Number(price || 0).toLocaleString('vi-VN') + '₫';

  const subtotal = buyItems.reduce((sum, item) => sum + (item.finalPrice * item.finalQty), 0);
  const discount = params.discount ? Number(params.discount) : 0;
  const shipping = (subtotal >= 500000 || buyItems.length === 0) ? 0 : 30000;
  const total = subtotal + shipping - discount;

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const handlePlaceOrder = async () => {
    try {
      // 🔹 Tạo object order gọn – chuẩn Firebase
      const orderData = {
        userId: "USER_001", // sau này thay bằng user đăng nhập
        items: buyItems.map(item => ({
          productId: item.id || "",
          name: item.name,
          price: item.finalPrice,
          quantity: item.finalQty,
          image: item.image || ""
        })),
        totalPrice: total,
        paymentMethod: paymentMethod,
        status: "PENDING",
        address: displayAddress,
        createdAt: serverTimestamp()
      };

      // 🔥 LƯU LÊN FIREBASE
      await addDoc(collection(db, "orders"), orderData);

      // 🔹 (GIỮ NGUYÊN) lưu local nếu bạn đang dùng
      const existingOrdersStr = await AsyncStorage.getItem('user_orders');
      const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
      await AsyncStorage.setItem(
        'user_orders',
        JSON.stringify([orderData, ...existingOrders])
      );

      // 🔹 Clear cart local
      await AsyncStorage.removeItem('user_cart');

      // 🔥 Hiện animation thành công
      setShowSuccess(true);

    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      Alert.alert("Lỗi", "Không thể hoàn tất đặt hàng.");
    }
  };


  useEffect(() => {
    if (showSuccess) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [showSuccess]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[styles.successContent, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.successCircle}><Ionicons name="checkmark-sharp" size={50} color="#4F46E5" /></View>
          <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
          <Text style={styles.successSub}>Cảm ơn bạn đã tin tưởng. Đơn hàng sẽ được giao sớm nhất.</Text>
          <TouchableOpacity style={styles.successBtn} onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.successBtnText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Địa chỉ */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerIconWrapper}>
              <View style={[styles.iconBox, { backgroundColor: '#F5F7FF' }]}><Ionicons name="location" size={16} color="#4F46E5" /></View>
              <Text style={styles.cardTitle}>Địa chỉ giao hàng</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/AddressManagementScreen" as any)} style={styles.changeBtn}>
              <Text style={styles.changeText}>Thay đổi</Text>
              <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          <View style={styles.addressCardInner}>
            <Text style={styles.userName}>{displayAddress.fullName} | {displayAddress.phone}</Text>
            <Text style={styles.addressText} numberOfLines={2}>{displayAddress.address}</Text>
          </View>
        </View>

        {/* Danh sách sản phẩm */}
        <View style={styles.card}>
          <Text style={styles.cardTitleInternal}>Sản phẩm ({buyItems.length})</Text>
          {buyItems.map((item, index) => (
            <View key={item.id || index} style={styles.productRow}>
              <Image source={{ uri: item.image }} style={styles.productImg} />
              <View style={styles.productInfo}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.variantText}>Màu: {item.colorSelected || 'Mặc định'}{item.sizeSelected ? ` / size: ${item.sizeSelected}` : ''}</Text>
                  <Text style={styles.productQty}>x{item.finalQty}</Text>
                </View>
                <Text style={styles.productPrice}>{safeFormatPrice(item.finalPrice)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Thanh toán */}
        <View style={styles.card}>
          <Text style={styles.cardTitleInternal}>Phương thức thanh toán</Text>
          <View style={styles.paymentGrid}>
            {[
              { id: 'cod', label: 'Tiền mặt', icon: 'cash-outline' },
              { id: 'bank', label: 'Chuyển khoản', icon: 'card-outline' },
              { id: 'wallet', label: 'E-Wallet', icon: 'wallet-outline' },
            ].map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => setPaymentMethod(method.id)}
                style={[styles.paymentItem, paymentMethod === method.id && styles.paymentItemActive]}
              >
                <Ionicons name={method.icon as any} size={20} color={paymentMethod === method.id ? '#4F46E5' : '#64748B'} />
                <Text style={[styles.paymentLabel, paymentMethod === method.id && styles.paymentLabelActive]}>{method.label}</Text>
                {paymentMethod === method.id && <View style={styles.checkBadge}><Ionicons name="checkmark" size={10} color="white" /></View>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Voucher */}
        <TouchableOpacity style={styles.promoCard}>
          <View style={styles.promoIconBg}><MaterialCommunityIcons name="ticket-percent" size={24} color="#EA580C" /></View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.promoTitle}>Voucher của Shop</Text>
            <Text style={styles.promoSub}>{discount > 0 ? `Đã áp dụng -${safeFormatPrice(discount)}` : 'Nhập mã để được giảm giá'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
          <Text style={styles.summaryValue}>{safeFormatPrice(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
          <Text style={shipping === 0 ? styles.discountText : styles.summaryValue}>{shipping === 0 ? "Miễn phí" : safeFormatPrice(shipping)}</Text>
        </View>

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{safeFormatPrice(Math.max(0, total))}</Text>
          </View>
          <TouchableOpacity style={styles.mainBtn} onPress={handlePlaceOrder}>
            <Text style={styles.mainBtnText}>Đặt hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== SUCCESS =====
  successContainer: {
    flex: 1,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
  },
  successCircle: {
    width: 90,
    height: 90,
    backgroundColor: '#fff',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
  },
  successSub: {
    fontSize: 15,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  successBtn: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
  },
  successBtnText: {
    color: '#4F46E5',
    fontWeight: '800',
    fontSize: 16,
  },

  // ===== HEADER =====
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },

  // ===== CONTENT =====
  scrollContent: {
    padding: 16,
    paddingBottom: 12, // ✅ FIX: KHÔNG CHỪA DƯ
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',

  },
  cardTitleInternal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 15,
  },

  changeBtn: {
    backgroundColor: '#F5F7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 12,
  },

  addressCardInner: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },

  // ===== PRODUCTS =====
  productRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },
  productImg: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  variantText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  productQty: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
    marginTop: 2,
  },
  productPrice: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },

  // ===== PAYMENT =====
  paymentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentItem: {
    width: (SCREEN_WIDTH - 64) / 3.2,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  paymentItemActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#F5F7FF',
  },
  paymentLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  paymentLabelActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4F46E5',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // ===== PROMO =====
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 16,
  },
  promoIconBg: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
  },
  promoSub: {
    fontSize: 12,
    color: '#C2410C',
    marginTop: 1,
  },

  // ===== FOOTER (KHÔNG ABSOLUTE – KHÔNG DƯ) =====
 footer: {
  backgroundColor: '#fff',

  /* ===== PADDING ===== */
  paddingHorizontal: 20,
  paddingTop: 20,

  // iOS có home indicator → cần nhiều hơn
  // Android có gesture bar → chừa vừa phải
  paddingBottom: Platform.OS === 'ios' ? 34 : 28,

  /* ===== ĐẨY FOOTER LÊN KHỎI NAV ANDROID ===== */
  marginBottom: Platform.OS === 'android' ? 0 : 0,

  /* ===== BORDER ===== */
  borderTopWidth: 1,
  borderTopColor: '#F1F5F9',

  /* ===== SHADOW ===== */
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 8,
},

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  summaryValue: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  discountText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4F46E5',
  },
  mainBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 16,
  },
  mainBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
