// import React, { useState, useCallback } from "react";
// import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, StatusBar } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter, useFocusEffect } from "expo-router";
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function CartScreen() {
//   const router = useRouter();
//   const [items, setItems] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [voucherApplied, setVoucherApplied] = useState(false);

//   // Cập nhật giỏ hàng mỗi khi người dùng quay lại màn hình này
//   useFocusEffect(
//     useCallback(() => {
//       loadCartFromStorage();
//     }, [])
//   );

//   const loadCartFromStorage = async () => {
//     try {
//       const savedCart = await AsyncStorage.getItem('user_cart');
//       setItems(savedCart ? JSON.parse(savedCart) : []);
//     } catch (e) {
//       console.error("Lỗi load giỏ hàng:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const saveCartToStorage = async (newItems: any[]) => {
//     setItems([...newItems]);
//     await AsyncStorage.setItem('user_cart', JSON.stringify(newItems));
//   };

//   const updateQuantity = (id: string, delta: number) => {
//     const newItems = items.map((item) => {
//       if (String(item.id) === String(id)) {
//         const newQty = Math.max(1, Math.min(item.quantity, item.cartQuantity + delta));
//         return { ...item, cartQuantity: newQty };
//       }
//       return item;
//     });
//     saveCartToStorage(newItems);
//   };

//   const removeItem = (id: string) => {
//     Alert.alert("Xác nhận", "Xóa sản phẩm này khỏi giỏ hàng?", [
//       { text: "Hủy", style: "cancel" },
//       { text: "Xóa", style: "destructive", onPress: () => {
//           const newItems = items.filter((item) => String(item.id) !== String(id));
//           saveCartToStorage(newItems);
//       }},
//     ]);
//   };

//   // Logic tính toán
//   const subtotal = items.reduce((s, i) => s + (i.priceNum * i.cartQuantity), 0);
//   const shipping = (subtotal >= 500000 || items.length === 0) ? 0 : 30000;
//   // Giả sử voucher giảm 10% tối đa 100k
//   const discount = voucherApplied ? Math.min(subtotal * 0.1, 100000) : 0;
//   const total = subtotal + shipping - discount;

//   const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

//   const handleCheckout = () => {
//     if (items.length === 0) return;
//     router.push({
//       pathname: "/CheckoutScreen" as any,
//       params: { 
//         cartData: JSON.stringify(items),
//         discount: discount.toString(),
//         shippingFee: shipping.toString()
//       }
//     });
//   };

//   if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtnHeader}>
//           <Ionicons name="arrow-back" size={24} color="white" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Giỏ hàng ({items.length})</Text>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 16 }}>
//         {items.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Ionicons name="cart-outline" size={80} color="#cbd5e1" />
//             <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
//             <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace("/")}>
//               <Text style={styles.shopBtnText}>Tiếp tục mua sắm</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           items.map((item) => (
//             <View key={item.id} style={styles.itemCard}>
//               <Image source={{ uri: item.image }} style={styles.itemImage} />
//               <View style={{ flex: 1, marginLeft: 12 }}>
//                 <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
//                 <Text style={styles.stockText}>Còn {item.quantity} trong kho</Text>
//                 <Text style={styles.itemPrice}>{formatPrice(item.priceNum)}</Text>
//                 <View style={styles.qtyRow}>
//                   <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
//                     <Ionicons name="remove" size={18} color="#1e293b" />
//                   </TouchableOpacity>
//                   <Text style={styles.qtyText}>{item.cartQuantity}</Text>
//                   <TouchableOpacity 
//                     onPress={() => updateQuantity(item.id, 1)} 
//                     style={styles.qtyBtn}
//                     disabled={item.cartQuantity >= item.quantity}
//                   >
//                     <Ionicons name="add" size={18} color={item.cartQuantity >= item.quantity ? "#cbd5e1" : "#1e293b"} />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//               <TouchableOpacity onPress={() => removeItem(item.id)} style={{ alignSelf: 'flex-start' }}>
//                 <Ionicons name="trash-outline" size={22} color="#ef4444" />
//               </TouchableOpacity>
//             </View>
//           ))
//         )}
//       </ScrollView>

//       {items.length > 0 && (
//         <View style={styles.footerCart}>
//           <TouchableOpacity 
//             style={[styles.voucherBtn, voucherApplied && styles.voucherApplied]} 
//             onPress={() => setVoucherApplied(!voucherApplied)}
//           >
//             <Ionicons name={voucherApplied ? "checkmark-circle" : "pricetag"} size={20} color={voucherApplied ? "#16a34a" : "#4f46e5"} />
//             <Text style={[styles.voucherBtnText, voucherApplied && {color: "#16a34a"}]}>
//               {voucherApplied ? "Đã áp dụng giảm giá 10%" : "Chọn mã giảm giá"}
//             </Text>
//           </TouchableOpacity>
          
//           <View style={styles.summaryBox}>
//             <View style={styles.row}>
//               <Text style={styles.rowLabel}>Tạm tính</Text>
//               <Text style={styles.rowValue}>{formatPrice(subtotal)}</Text>
//             </View>
//             <View style={styles.row}>
//               <Text style={styles.rowLabel}>Phí vận chuyển</Text>
//               <Text style={styles.rowValue}>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</Text>
//             </View>
//             {discount > 0 && (
//               <View style={styles.row}>
//                 <Text style={styles.rowLabel}>Giảm giá</Text>
//                 <Text style={[styles.rowValue, {color: '#16a34a', fontWeight: 'bold'}]}>-{formatPrice(discount)}</Text>
//               </View>
//             )}
//             <View style={[styles.row, styles.totalRow]}>
//               <Text style={styles.totalLabel}>Tổng cộng</Text>
//               <Text style={styles.totalValue}>{formatPrice(total)}</Text>
//             </View>
//           </View>

//           <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
//             <Text style={styles.checkoutBtnText}>Thanh toán • {formatPrice(total)}</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#f8fafc" },
//   center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   header: { backgroundColor: "#4f46e5", paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
//   backBtnHeader: { marginRight: 15 },
//   headerTitle: { color: "white", fontSize: 20, fontWeight: 'bold' },
//   itemCard: { flexDirection: 'row', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 10 },
//   itemImage: { width: 80, height: 80, borderRadius: 15, backgroundColor: '#f1f5f9' },
//   itemName: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
//   stockText: { fontSize: 12, color: '#64748b', marginVertical: 2 },
//   itemPrice: { color: '#4f46e5', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
//   qtyRow: { flexDirection: 'row', alignItems: 'center' },
//   qtyBtn: { backgroundColor: '#f1f5f9', padding: 6, borderRadius: 8 },
//   qtyText: { marginHorizontal: 15, fontWeight: 'bold', fontSize: 16 },
//   footerCart: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, shadowColor: '#000', shadowOffset: {width: 0, height: -10}, shadowOpacity: 0.1, shadowRadius: 10 },
//   voucherBtn: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#f5f3ff', borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd6fe', borderStyle: 'dashed' },
//   voucherApplied: { backgroundColor: '#dcfce7', borderColor: '#86efac', borderStyle: 'solid' },
//   voucherBtnText: { marginLeft: 10, color: '#4f46e5', fontWeight: '500' },
//   summaryBox: { marginBottom: 15 },
//   row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
//   rowLabel: { color: '#64748b', fontSize: 14 },
//   rowValue: { color: '#1e293b', fontSize: 14 },
//   totalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
//   totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
//   totalValue: { fontSize: 20, fontWeight: 'bold', color: '#4f46e5' },
//   checkoutBtn: { backgroundColor: '#4f46e5', padding: 18, borderRadius: 20, alignItems: 'center' },
//   checkoutBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
//   emptyContainer: { alignItems: 'center', marginTop: 100 },
//   emptyText: { color: '#94a3b8', marginTop: 15, fontSize: 16 },
//   shopBtn: { marginTop: 20, backgroundColor: '#4f46e5', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
//   shopBtnText: { color: 'white', fontWeight: '600' }
// });


import React, { useState, useCallback } from "react";
import { 
  View, Text, Image, TouchableOpacity, ScrollView, 
  StyleSheet, Alert, ActivityIndicator, StatusBar, Platform 
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherApplied, setVoucherApplied] = useState(false);

  // Load lại giỏ hàng mỗi khi focus vào màn hình
  useFocusEffect(
    useCallback(() => {
      loadCartFromStorage();
    }, [])
  );

  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('user_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Chuẩn hóa dữ liệu để tránh lỗi NaN
        const cleanData = parsed.map((item: any) => ({
          ...item,
          priceNum: Number(item.priceNum || item.price || 0),
          cartQuantity: Number(item.cartQuantity || 1),
          quantity: Number(item.quantity || 1) // Tồn kho
        }));
        setItems(cleanData);
      } else {
        setItems([]);
      }
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
      { 
        text: "Xóa", 
        style: "destructive", 
        onPress: () => {
          const newItems = items.filter((item) => String(item.id) !== String(id));
          saveCartToStorage(newItems);
        }
      },
    ]);
  };

  // --- LOGIC TÍNH TOÁN ---
  const subtotal = items.reduce((s, i) => s + (i.priceNum * i.cartQuantity), 0);
  const shipping = (subtotal >= 500000 || items.length === 0) ? 0 : 30000;
  const discount = voucherApplied ? Math.min(subtotal * 0.1, 100000) : 0;
  const total = subtotal + shipping - discount;

  const formatPrice = (price: number) => {
    return (price || 0).toLocaleString("vi-VN") + "đ";
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push({
      pathname: "/CheckoutScreen" as any,
      params: { 
        cartData: JSON.stringify(items),
        discount: discount.toString()
      }
    });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnHeader}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({items.length})</Text>
        <TouchableOpacity onPress={() => {
           if(items.length > 0) Alert.alert("Xóa tất cả", "Bạn muốn làm trống giỏ hàng?", [
             {text: "Hủy"}, {text: "Xóa", onPress: () => saveCartToStorage([])}
           ])
        }}>
           <Text style={{color: '#fee2e2', fontSize: 13}}>Xóa sạch</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="cart-outline" size={70} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
            <Text style={styles.emptySub}>Hãy quay lại và chọn cho mình những sản phẩm ưng ý nhất nhé!</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace("/(tabs)/home")}>
              <Text style={styles.shopBtnText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item, index) => (
            <View key={item.id || index} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                
                {/* Hiển thị Màu/Size */}
                {(item.colorSelected || item.sizeSelected) && (
                  <Text style={styles.variantText}>
                    Phân loại: {item.colorSelected}{item.sizeSelected ? `, ${item.sizeSelected}` : ''}
                  </Text>
                )}
                
                <Text style={styles.itemPrice}>{formatPrice(item.priceNum)}</Text>
                
                <View style={styles.qtyRow}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                    <Ionicons name="remove" size={16} color="#1e293b" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.cartQuantity}</Text>
                  <TouchableOpacity 
                    onPress={() => updateQuantity(item.id, 1)} 
                    style={styles.qtyBtn}
                    disabled={item.cartQuantity >= item.quantity}
                  >
                    <Ionicons 
                      name="add" 
                      size={16} 
                      color={item.cartQuantity >= item.quantity ? "#cbd5e1" : "#1e293b"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Footer Thanh toán */}
      {items.length > 0 && (
        <View style={styles.footerCart}>
          <TouchableOpacity 
            style={[styles.voucherBtn, voucherApplied && styles.voucherApplied]} 
            onPress={() => setVoucherApplied(!voucherApplied)}
          >
            <MaterialCommunityIcons 
              name={voucherApplied ? "ticket-percent" : "ticket-outline"} 
              size={22} 
              color={voucherApplied ? "#16a34a" : "#4f46e5"} 
            />
            <Text style={[styles.voucherBtnText, voucherApplied && {color: "#16a34a"}]}>
              {voucherApplied ? "Đã áp dụng giảm giá 10%" : "Chọn mã giảm giá"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>
          
          <View style={styles.summaryBox}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Tạm tính</Text>
              <Text style={styles.rowValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Phí vận chuyển</Text>
              <Text style={[styles.rowValue, shipping === 0 && {color: '#10b981'}]}>
                {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
              </Text>
            </View>
            {discount > 0 && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Giảm giá</Text>
                <Text style={[styles.rowValue, {color: '#ef4444', fontWeight: 'bold'}]}>-{formatPrice(discount)}</Text>
              </View>
            )}
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>Xác nhận thanh toán</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    backgroundColor: "#4f46e5", 
    paddingTop: Platform.OS === 'ios' ? 60 : 45, 
    paddingBottom: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30 
  },
  backBtnHeader: { padding: 4 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: '800' },
  itemCard: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 12, 
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 
  },
  itemImage: { width: 90, height: 90, borderRadius: 16, backgroundColor: '#f1f5f9' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  variantText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  itemPrice: { color: '#4f46e5', fontWeight: '800', fontSize: 16, marginVertical: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  qtyBtn: { backgroundColor: '#f1f5f9', width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qtyText: { marginHorizontal: 15, fontWeight: '800', fontSize: 15, color: '#1e293b' },
  deleteBtn: { alignSelf: 'flex-start', padding: 8 },
  footerCart: { 
    position: 'absolute', bottom: 0, width: '100%',
    backgroundColor: 'white', padding: 20, paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    shadowColor: '#000', shadowOffset: {width: 0, height: -10}, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 
  },
  voucherBtn: { 
    flexDirection: 'row', alignItems: 'center', padding: 12, 
    backgroundColor: '#f5f3ff', borderRadius: 15, marginBottom: 15, 
    borderWidth: 1, borderColor: '#ddd6fe', borderStyle: 'dashed' 
  },
  voucherApplied: { backgroundColor: '#dcfce7', borderColor: '#86efac', borderStyle: 'solid' },
  voucherBtnText: { flex: 1, marginLeft: 10, color: '#4f46e5', fontWeight: '600', fontSize: 13 },
  summaryBox: { marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rowLabel: { color: '#64748b', fontSize: 13 },
  rowValue: { color: '#1e293b', fontSize: 13, fontWeight: '600' },
  totalRow: { marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  totalValue: { fontSize: 20, fontWeight: '900', color: '#4f46e5' },
  checkoutBtn: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 18, alignItems: 'center', shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  checkoutBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconBg: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  emptySub: { textAlign: 'center', color: '#94a3b8', lineHeight: 20, fontSize: 14 },
  shopBtn: { marginTop: 25, backgroundColor: '#4f46e5', paddingHorizontal: 35, paddingVertical: 14, borderRadius: 15 },
  shopBtnText: { color: 'white', fontWeight: '700' }
});