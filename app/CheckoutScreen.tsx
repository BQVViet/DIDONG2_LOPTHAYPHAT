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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const cartItems = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    price: 29990000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1758411898502-013b0cd3421c?q=80&w=400',
  },
  {
    id: 2,
    name: 'AirPods Pro 2nd Gen',
    price: 6490000,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1748698361079-fd70b999be1a?q=80&w=400',
  },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showSuccess, setShowSuccess] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = 500000;
  const total = subtotal - discount;

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const handlePlaceOrder = () => {
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
          <TouchableOpacity style={styles.successBtn} onPress={() => setShowSuccess(false)}>
            <Text style={styles.successBtnText}>Xem đơn hàng</Text>
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
              <View style={[styles.iconBox, { backgroundColor: '#F0F7FF' }]}>
                <Ionicons name="location" size={18} color="#2563EB" />
              </View>
              <Text style={styles.cardTitle}>Giao tới</Text>
            </View>
            <TouchableOpacity><Text style={styles.changeText}>Sửa</Text></TouchableOpacity>
          </View>
          <View style={styles.addressCardInner}>
            <Text style={styles.userName}>Nguyễn Văn A • 0912 345 678</Text>
            <Text style={styles.addressText}>123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</Text>
          </View>
        </View>

        {/* Sản phẩm */}
        <View style={styles.card}>
          <Text style={styles.cardTitleInternal}>Sản phẩm của bạn</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.productRow}>
              <Image source={{ uri: item.image }} style={styles.productImg} />
              <View style={styles.productInfo}>
                <View>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productQty}>Số lượng: {item.quantity}</Text>
                </View>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Phương thức thanh toán */}
        <View style={styles.card}>
          <Text style={styles.cardTitleInternal}>Thanh toán</Text>
          <View style={styles.paymentGrid}>
            {[
              { id: 'cod', label: 'Tiền mặt', icon: 'cash-outline' },
              { id: 'bank', label: 'Chuyển khoản', icon: 'business-outline' },
              { id: 'wallet', label: 'Ví MoMo', icon: 'wallet-outline' },
            ].map((method) => (
              <TouchableOpacity 
                key={method.id} 
                onPress={() => setPaymentMethod(method.id)}
                style={[styles.paymentItem, paymentMethod === method.id && styles.paymentItemActive]}
              >
                <Ionicons name={method.icon as any} size={22} color={paymentMethod === method.id ? '#2563EB' : '#64748B'} />
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
            <Text style={styles.summaryLabel}>Giảm giá</Text>
            <Text style={styles.discountText}>-{formatPrice(discount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
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
  
  // SUCCESS SCREEN
  successContainer: { flex: 1, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center', padding: 30 },
  successContent: { alignItems: 'center', width: '100%' },
  successCircle: { 
    width: 100, height: 100, backgroundColor: 'white', borderRadius: 50, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 15, elevation: 10
  },
  successTitle: { fontSize: 28, fontWeight: '900', color: 'white', marginBottom: 12, letterSpacing: -0.5 },
  successSub: { fontSize: 16, color: '#D1FAE5', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  successBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  successBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },

  // HEADER
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white' },
  backButton: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', letterSpacing: -0.2 },

  scrollContent: { padding: 16, paddingBottom: 180 },

  // CARDS
  card: { backgroundColor: 'white', borderRadius: 28, padding: 20, marginBottom: 16, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerIconWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  cardTitleInternal: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 18, letterSpacing: -0.3 },
  changeText: { color: '#2563EB', fontWeight: '700', fontSize: 14 },
  
  addressCardInner: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#F1F5F9' },
  userName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  addressText: { fontSize: 14, color: '#64748B', lineHeight: 20 },

  // PRODUCTS
  productRow: { flexDirection: 'row', gap: 14, marginBottom: 18, alignItems: 'center' },
  productImg: { width: 75, height: 75, borderRadius: 18, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#F1F5F9' },
  productInfo: { flex: 1, height: 70, justifyContent: 'space-between' },
  productName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  productQty: { fontSize: 13, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  productPrice: { color: '#0F172A', fontWeight: '800', fontSize: 16 },

  // PAYMENT
  paymentGrid: { flexDirection: 'row', gap: 10 },
  paymentItem: { flex: 1, paddingVertical: 16, borderRadius: 18, borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', gap: 8, backgroundColor: 'white' },
  paymentItemActive: { borderColor: '#2563EB', backgroundColor: '#F0F7FF' },
  paymentLabel: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  paymentLabelActive: { color: '#2563EB', fontWeight: '700' },
  checkBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#2563EB', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  // PROMO
  promoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF7ED', borderRadius: 22, borderWidth: 1, borderColor: '#FFEDD5' },
  promoIconBg: { width: 44, height: 44, backgroundColor: 'white', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  promoTitle: { fontSize: 15, fontWeight: '800', color: '#9A3412' },
  promoSub: { fontSize: 13, color: '#C2410C', opacity: 0.7 },

  // FOOTER
  footer: { 
    position: 'absolute', bottom: 0, width: width, backgroundColor: 'white', 
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 20
  },
  summaryContainer: { width: '100%' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  summaryValue: { color: '#0F172A', fontWeight: '700' },
  discountText: { color: '#059669', fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderColor: '#F1F5F9' },
  totalLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 2 },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  mainBtn: { backgroundColor: '#2563EB', paddingVertical: 16, paddingHorizontal: 35, borderRadius: 18, shadowColor: "#2563EB", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  mainBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
});