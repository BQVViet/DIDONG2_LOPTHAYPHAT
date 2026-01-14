import React, { useState, useCallback } from "react";
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, StatusBar, Platform, SafeAreaView
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherApplied, setVoucherApplied] = useState(false);

  // 1. TẢI DỮ LIỆU GIỎ HÀNG (Dùng useFocusEffect để luôn cập nhật khi quay lại màn hình này)
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
        // Chuẩn hóa dữ liệu để tránh lỗi NaN và đảm bảo các trường số luôn hợp lệ
        const cleanData = parsed.map((item: any) => ({
          ...item,
          priceNum: Number(item.priceNum || item.price || 0),
          cartQuantity: Number(item.cartQuantity || 1),
          quantity: Number(item.quantity || 10) // Tồn kho mặc định nếu không có
        }));
        setItems(cleanData);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error("Lỗi load giỏ hàng:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. CẬP NHẬT SỐ LƯỢNG & LƯU LẠI VÀO STORAGE
  const saveCartToStorage = async (newItems: any[]) => {
    setItems([...newItems]);
    await AsyncStorage.setItem('user_cart', JSON.stringify(newItems));
  };

  const updateQuantity = (id: string, delta: number) => {
    const newItems = items.map((item) => {
      if (String(item.id) === String(id)) {
        // Giới hạn tối thiểu là 1 và tối đa là tồn kho (item.quantity)
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

  // 3. LOGIC TÍNH TOÁN TÀI CHÍNH
  const subtotal = items.reduce((s, i) => s + (i.priceNum * i.cartQuantity), 0);
  const shipping = (subtotal >= 500000 || items.length === 0) ? 0 : 30000;
  const discount = voucherApplied ? Math.min(subtotal * 0.1, 100000) : 0; // Giảm 10%, tối đa 100k
  const total = subtotal + shipping - discount;

  const formatPrice = (price: number) => (price || 0).toLocaleString("vi-VN") + "đ";

  // 4. CHUYỂN SANG MÀN HÌNH THANH TOÁN
  const handleCheckout = () => {
    if (items.length === 0) return;

    // Gửi toàn bộ dữ liệu giỏ hàng và thông tin giảm giá sang Checkout
    router.push({
      pathname: "/CheckoutScreen" as any,
      params: {
        cartData: JSON.stringify(items),
        discount: discount.toString()
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" />

      {/* Header Chuyên nghiệp */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={26} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Giỏ hàng</Text>
              <Text style={styles.headerSubtitle}>{items.length} sản phẩm</Text>
            </View>
            <TouchableOpacity
              onPress={() => items.length > 0 && Alert.alert("Xóa tất cả", "Làm trống giỏ hàng?", [
                { text: "Hủy" }, { text: "Xóa", onPress: () => saveCartToStorage([]) }
              ])}
              style={styles.iconButton}
            >
              <Ionicons name="trash-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {items.length === 0 ? (
          /* Giao diện khi giỏ hàng trống */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="cart-outline" size={80} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
            <Text style={styles.emptySub}>Hãy chọn những sản phẩm tuyệt vời cho mình nhé!</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace("/(tabs)/home")}>
              <Text style={styles.shopBtnText}>Mua sắm ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Danh sách sản phẩm */
          items.map((item, index) => (
            <View key={item.id || index} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                </View>

                {/* Phân loại sản phẩm */}
                {(item.colorSelected || item.sizeSelected) && (
                  <Text style={styles.variantText}>
                    Màu: {item.colorSelected}{item.sizeSelected ? ` / size: ${item.sizeSelected}` : ''}
                  </Text>
                )}

                <Text style={styles.itemPrice}>{formatPrice(item.priceNum)}</Text>

                <View style={styles.itemFooter}>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={18} color="#4f46e5" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.cartQuantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, 1)}
                      style={styles.qtyBtn}
                      disabled={item.cartQuantity >= item.quantity}
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={item.cartQuantity >= item.quantity ? "#cbd5e1" : "#4f46e5"}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Footer Tổng kết & Thanh toán */}
      {items.length > 0 && (
        <View style={styles.footerCart}>
          {/* Voucher Section */}
          <TouchableOpacity
            style={[styles.voucherBtn, voucherApplied && styles.voucherApplied]}
            onPress={() => setVoucherApplied(!voucherApplied)}
          >
            <MaterialCommunityIcons
              name={voucherApplied ? "ticket-percent" : "ticket-outline"}
              size={22}
              color={voucherApplied ? "#16a34a" : "#4f46e5"}
            />
            <Text style={[styles.voucherBtnText, voucherApplied && { color: "#16a34a" }]}>
              {voucherApplied ? "Đã áp dụng giảm giá 10%" : "Chọn mã giảm giá (Voucher)"}
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
              <Text style={[styles.rowValue, shipping === 0 && { color: '#10b981' }]}>
                {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
              </Text>
            </View>
            {discount > 0 && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Giảm giá</Text>
                <Text style={[styles.rowValue, { color: '#ef4444' }]}>-{formatPrice(discount)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>XÁC NHẬN THANH TOÁN</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* ================== BASE ================== */
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ================== HEADER ================== */
  header: {
    backgroundColor: "#4f46e5",
    paddingTop: Platform.OS === "ios" ? 55 : 40,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 2,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  /* ================== LIST ================== */
  scrollContent: {
    padding: 16,
    paddingBottom: 300,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 20,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  itemImage: {
    width: 92,
    height: 92,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    height: 92,
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  variantText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontStyle: "italic",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#4f46e5",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* ================== QUANTITY ================== */
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#1e293b",
  },

  deleteBtn: {
    padding: 6,
  },

  /* ================== FOOTER ================== */
  // footerCart: {
  //   position: "absolute",
  //   bottom: 0,


  //   width: "100%",
  //   backgroundColor: "white",

  //   padding: 20,
  //   paddingBottom: Platform.OS === "ios" ? 34 : 20,
  //   paddingTop: 20,
  //   borderTopLeftRadius: 32,
  //   borderTopRightRadius: 32,

  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: -8 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 14,
  //   elevation: 18,
  // },
 footerCart: {
  position: "absolute",

  left: 0,
  right: 0,

  // 🔥 ĐẨY FOOTER LÊN (QUAN TRỌNG)
  bottom: Platform.OS === "android" ? 0 : 0,
  width: "100%",
  paddingTop: 20,
  backgroundColor: "white",
  padding: 20,

  // 🔥 Android gesture bar rất cao → phải cộng thêm
  paddingBottom: Platform.OS === "ios" ? 34 : 32,

  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: -8 },
  shadowOpacity: 0.12,
  shadowRadius: 14,
  elevation: 18,
},



  /* ================== VOUCHER ================== */
  voucherBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    borderStyle: "dashed",
    marginBottom: 14,
  },
  voucherApplied: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
    borderStyle: "solid",
  },
  voucherBtnText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#4f46e5",
  },

  /* ================== SUMMARY ================== */
  summaryBox: {
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  rowLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    marginTop: 10,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#4f46e5",
  },

  checkoutBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    elevation: 6,
  },
  checkoutBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  /* ================== EMPTY ================== */
  emptyContainer: {
    alignItems: "center",
    marginTop: 90,
    paddingHorizontal: 40,
    
  },
  emptyIconBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  shopBtn: {
    marginTop: 26,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 18,
  },
  shopBtnText: {
    color: "white",
    fontWeight: "800",
  },
});



