import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherApplied, setVoucherApplied] = useState(false);

  // Cập nhật giỏ hàng mỗi khi người dùng quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      loadCartFromStorage();
    }, [])
  );

  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('user_cart');
      setItems(savedCart ? JSON.parse(savedCart) : []);
    } catch (e) {
      console.error("Lỗi load giỏ hàng:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = async (newItems: any[]) => {
    setItems([...newItems]);
    await AsyncStorage.setItem('user_cart', JSON.stringify(newItems));
  };

  const updateQuantity = (id: string, delta: number) => {
    const newItems = items.map((item) => {
      if (String(item.id) === String(id)) {
        const newQty = Math.max(1, Math.min(item.quantity, item.cartQuantity + delta));
        return { ...item, cartQuantity: newQty };
      }
      return item;
    });
    saveCartToStorage(newItems);
  };

  const removeItem = (id: string) => {
    Alert.alert("Xác nhận", "Xóa sản phẩm này khỏi giỏ hàng?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => {
          const newItems = items.filter((item) => String(item.id) !== String(id));
          saveCartToStorage(newItems);
      }},
    ]);
  };

  // Logic tính toán
  const subtotal = items.reduce((s, i) => s + (i.priceNum * i.cartQuantity), 0);
  const shipping = (subtotal >= 500000 || items.length === 0) ? 0 : 30000;
  // Giả sử voucher giảm 10% tối đa 100k
  const discount = voucherApplied ? Math.min(subtotal * 0.1, 100000) : 0;
  const total = subtotal + shipping - discount;

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push({
      pathname: "/CheckoutScreen" as any,
      params: { 
        cartData: JSON.stringify(items),
        discount: discount.toString(),
        shippingFee: shipping.toString()
      }
    });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnHeader}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({items.length})</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace("/")}>
              <Text style={styles.shopBtnText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.stockText}>Còn {item.quantity} trong kho</Text>
                <Text style={styles.itemPrice}>{formatPrice(item.priceNum)}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                    <Ionicons name="remove" size={18} color="#1e293b" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.cartQuantity}</Text>
                  <TouchableOpacity 
                    onPress={() => updateQuantity(item.id, 1)} 
                    style={styles.qtyBtn}
                    disabled={item.cartQuantity >= item.quantity}
                  >
                    <Ionicons name="add" size={18} color={item.cartQuantity >= item.quantity ? "#cbd5e1" : "#1e293b"} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={{ alignSelf: 'flex-start' }}>
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.footerCart}>
          <TouchableOpacity 
            style={[styles.voucherBtn, voucherApplied && styles.voucherApplied]} 
            onPress={() => setVoucherApplied(!voucherApplied)}
          >
            <Ionicons name={voucherApplied ? "checkmark-circle" : "pricetag"} size={20} color={voucherApplied ? "#16a34a" : "#4f46e5"} />
            <Text style={[styles.voucherBtnText, voucherApplied && {color: "#16a34a"}]}>
              {voucherApplied ? "Đã áp dụng giảm giá 10%" : "Chọn mã giảm giá"}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.summaryBox}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tạm tính</Text>
              <Text style={styles.rowValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Phí vận chuyển</Text>
              <Text style={styles.rowValue}>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Giảm giá</Text>
                <Text style={[styles.rowValue, {color: '#16a34a', fontWeight: 'bold'}]}>-{formatPrice(discount)}</Text>
              </View>
            )}
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>Thanh toán • {formatPrice(total)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: "#4f46e5", paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  backBtnHeader: { marginRight: 15 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: 'bold' },
  itemCard: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 10 },
  itemImage: { width: 80, height: 80, borderRadius: 15, backgroundColor: '#f1f5f9' },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  stockText: { fontSize: 12, color: '#64748b', marginVertical: 2 },
  itemPrice: { color: '#4f46e5', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { backgroundColor: '#f1f5f9', padding: 6, borderRadius: 8 },
  qtyText: { marginHorizontal: 15, fontWeight: 'bold', fontSize: 16 },
  footerCart: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, shadowColor: '#000', shadowOffset: {width: 0, height: -10}, shadowOpacity: 0.1, shadowRadius: 10 },
  voucherBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#f5f3ff', borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd6fe', borderStyle: 'dashed' },
  voucherApplied: { backgroundColor: '#dcfce7', borderColor: '#86efac', borderStyle: 'solid' },
  voucherBtnText: { marginLeft: 10, color: '#4f46e5', fontWeight: '500' },
  summaryBox: { marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowLabel: { color: '#64748b', fontSize: 14 },
  rowValue: { color: '#1e293b', fontSize: 14 },
  totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#4f46e5' },
  checkoutBtn: { backgroundColor: '#4f46e5', padding: 18, borderRadius: 20, alignItems: 'center' },
  checkoutBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', marginTop: 15, fontSize: 16 },
  shopBtn: { marginTop: 20, backgroundColor: '#4f46e5', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: 'white', fontWeight: '600' }
});