import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  
  const [buyItems, setBuyItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showSuccess, setShowSuccess] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // --- 1. XỬ LÝ ĐỊA CHỈ NHẬN HÀNG ---
  const displayAddress = {
    fullName: params.selectedName || 'Nguyễn Văn A',
    phone: params.selectedPhone || '0912 345 678',
    address: params.selectedAddress || '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  };

  // --- 2. ĐỒNG BỘ DỮ LIỆU SẢN PHẨM (CHỐNG MẤT HÀNG) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        if (params.cartData) {
          // Nếu đi từ Giỏ hàng sang (có data mới)
          const data = JSON.parse(params.cartData as string);
          setBuyItems(data);
          await AsyncStorage.setItem('temp_checkout_items', params.cartData as string);
        } else {
          // Nếu quay lại từ trang khác (params mất), lấy từ bộ nhớ máy
          const savedData = await AsyncStorage.getItem('temp_checkout_items');
          if (savedData) {
            setBuyItems(JSON.parse(savedData));
          }
        }
      } catch (error) {
        console.error("Lỗi đồng bộ dữ liệu Checkout:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.cartData]);

  // --- 3. TÍNH TOÁN GIÁ TRỊ ---
  const subtotal = buyItems.reduce((sum, item) => sum + (item.priceNum * item.cartQuantity), 0);
  const discount = params.discount ? Number(params.discount) : 0;
  const shipping = (subtotal >= 500000 || buyItems.length === 0) ? 0 : 30000;
  const total = subtotal + shipping - discount;

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const handlePlaceOrder = async () => {
    // Xóa bộ nhớ tạm sau khi đặt hàng thành công
    await AsyncStorage.removeItem('temp_checkout_items');
    setShowSuccess(true);
  };

  useEffect(() => {
    if (showSuccess) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [showSuccess]);

  if (loading) return <View style={styles.addressCardInner}><ActivityIndicator size="large" color="#4F46E5" /></View>;

  // GIAO DIỆN THÀNH CÔNG
  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[styles.successContent, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark-sharp" size={60} color="#059669" />
          </View>
          <Text style={styles.successTitle}>Đã đặt hàng!</Text>
          <Text style={styles.successSub}>Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.</Text>
          <TouchableOpacity style={styles.successBtn} onPress={() => router.replace('/')}>
            <Text style={styles.successBtnText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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
              <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}><Ionicons name="location" size={18} color="#4F46E5" /></View>
              <Text style={styles.cardTitle}>Giao tới</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/AddressManagementScreen" as any)} style={styles.changeBtn}>
              <Text style={styles.changeText}>Thay đổi</Text>
              <Ionicons name="chevron-forward" size={14} color="#4F46E5" />
            </TouchableOpacity>
          </View>
          <View style={styles.addressCardInner}>
            <Text style={styles.userName}>{displayAddress.fullName} • {displayAddress.phone}</Text>
            <Text style={styles.addressText}>{displayAddress.address}</Text>
          </View>
        </View>

        {/* Sản phẩm */}
        <View style={styles.card}>
          <Text style={styles.cardTitleInternal}>Sản phẩm ({buyItems.length})</Text>
          {buyItems.map((item, index) => (
            <View key={item.id || index} style={styles.productRow}>
              <Image source={{ uri: item.image }} style={styles.productImg} />
              <View style={styles.productInfo}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productQty}>Số lượng: {item.cartQuantity}</Text>
                </View>
                <Text style={styles.productPrice}>{formatPrice(item.priceNum)}</Text>
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
              { id: 'bank', label: 'Chuyển khoản', icon: 'swap-horizontal-outline' },
              { id: 'wallet', label: 'Ví điện tử', icon: 'wallet-outline' },
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
          <View style={styles.promoIconBg}>
            <MaterialCommunityIcons name="ticket-percent" size={24} color="#EA580C" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.promoTitle}>Voucher giảm 500k</Text>
            <Text style={styles.promoSub}>Đã áp dụng mã tiết kiệm nhất</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={shipping === 0 ? styles.discountText : styles.summaryValue}>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá</Text>
              <Text style={styles.discountText}>-{formatPrice(discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>{formatPrice(Math.max(0, total))}</Text>
            </View>
            <TouchableOpacity style={styles.mainBtn} onPress={handlePlaceOrder}>
              <Text style={styles.mainBtnText}>Đặt hàng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  successContainer: { flex: 1, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successContent: { alignItems: 'center', width: '100%' },
  successCircle: { width: 90, height: 90, backgroundColor: 'white', borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  successTitle: { fontSize: 28, fontWeight: '900', color: 'white', marginBottom: 10 },
  successSub: { fontSize: 15, color: '#E0E7FF', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  successBtn: { backgroundColor: 'white', paddingVertical: 16, paddingHorizontal: 35, borderRadius: 16, elevation: 5 },
  successBtnText: { color: '#4F46E5', fontWeight: '800', fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  backButton: { width: 40, height: 40, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  scrollContent: { padding: 16, paddingBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerIconWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  cardTitleInternal: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  changeText: { color: '#4F46E5', fontWeight: '700', fontSize: 12, marginRight: 2 },
  addressCardInner: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#4F46E5' },
  userName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  productRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  productImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F1F5F9' },
  productInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 14, fontWeight: '700', color: '#0F172A', flexShrink: 1 },
  productQty: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  productPrice: { color: '#0F172A', fontWeight: '800', fontSize: 15 },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  paymentItem: { flex: 1, minWidth: '28%', paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', gap: 6 },
  paymentItemActive: { borderColor: '#4F46E5', backgroundColor: '#F5F7FF' },
  paymentLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  paymentLabelActive: { color: '#4F46E5', fontWeight: '700' },
  checkBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#4F46E5', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  promoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF7ED', borderRadius: 20, borderWidth: 1, borderColor: '#FFEDD5', marginBottom: 10 },
  promoIconBg: { width: 40, height: 40, backgroundColor: 'white', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  promoTitle: { fontSize: 14, fontWeight: '800', color: '#9A3412' },
  promoSub: { fontSize: 12, color: '#C2410C', marginTop: 1 },
  footer: { backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  summaryContainer: { width: '100%' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { color: '#64748B', fontSize: 13 },
  summaryValue: { color: '#0F172A', fontWeight: '600', fontSize: 14 },
  discountText: { color: '#10B981', fontWeight: '700', fontSize: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#F1F5F9' },
  totalLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#4F46E5' },
  mainBtn: { backgroundColor: '#4F46E5', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 16, elevation: 4, shadowColor: '#4F46E5', shadowOpacity: 0.2, shadowRadius: 5 },
  mainBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
});