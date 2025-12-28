import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// 1. SỬA TẠI ĐÂY: Thay đổi dòng import bị lỗi UnableToResolve
import { useRouter } from "expo-router"; 

const initialCartItems = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB",
    price: 29990000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1758411898502-013b0cd3421c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    color: "Titan Tự Nhiên",
    stock: 5,
  },
  {
    id: 2,
    name: "AirPods Pro 2nd Gen",
    price: 6490000,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1748698361079-fd70b999be1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    color: "Trắng",
    stock: 10,
  },
  {
    id: 3,
    name: "Apple Watch Series 9",
    price: 10990000,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1719744755507-a4c856c57cf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    color: "Midnight",
    stock: 3,
  },
];

export default function CartScreen() {
  // 2. SỬA TẠI ĐÂY: Khai báo router bằng hook useRouter()
  const router = useRouter(); 

  const [items, setItems] = useState(initialCartItems);
  const [voucherApplied, setVoucherApplied] = useState(false);

  const updateQuantity = (id: number, delta: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, Math.min(item.stock, item.quantity + delta)),
            }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const discount = voucherApplied ? 500000 : 0;
  const total = subtotal + shipping - discount;

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <Text style={styles.headerSub}>{items.length} sản phẩm</Text>
        </View>

        <View style={styles.headerSummary}>
          <Text style={styles.headerSummaryText}>Tổng tạm tính</Text>
          <Text style={styles.headerSummaryPrice}>{formatPrice(subtotal)}</Text>
        </View>
      </View>

      {/* Cart Items */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View>
                <Image source={{ uri: item.image }} style={styles.itemImage} />

                {item.quantity >= item.stock && (
                  <View style={styles.outOfStockLayer}>
                    <Text style={{ color: "white", fontSize: 12 }}>Hết hàng</Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemColor}>
                  Màu: {item.color} • Còn {item.stock} sản phẩm
                </Text>
                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              </View>

              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>

            {/* Quantity */}
            <View style={styles.qtyRow}>
              <View style={styles.qtyLeft}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Ionicons name="remove" size={20} color="#000" />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    item.quantity >= item.stock && { backgroundColor: "#ddd" },
                  ]}
                  onPress={() => updateQuantity(item.id, 1)}
                  disabled={item.quantity >= item.stock}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={item.quantity >= item.stock ? "#888" : "#000"}
                  />
                </TouchableOpacity>
              </View>

              <View>
                <Text style={styles.totalLabel}>Tổng</Text>
                <Text style={styles.totalValue}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Voucher */}
        <TouchableOpacity
          onPress={() => setVoucherApplied(!voucherApplied)}
          style={[styles.voucherBox, voucherApplied && styles.voucherApplied]}
        >
          <View
            style={[
              styles.voucherIconWrap,
              voucherApplied ? styles.voucherIconApplied : {},
            ]}
          >
            {voucherApplied ? (
              <Ionicons name="gift" size={26} color="white" />
            ) : (
              <Ionicons name="pricetag" size={26} color="#2563eb" />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.voucherTitle, voucherApplied && { color: "white" }]}>
              {voucherApplied ? "Mã giảm 500K đã áp dụng" : "Áp dụng mã giảm giá"}
            </Text>
            <Text style={[styles.voucherSub, voucherApplied && { color: "white" }]}>
              {voucherApplied ? "Bạn đã tiết kiệm 500.000đ" : "Tiết kiệm thêm cho đơn hàng"}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={24}
            color={voucherApplied ? "white" : "#2563eb"}
          />
        </TouchableOpacity>

        {/* Shipping */}
        <View style={styles.shippingBox}>
          <View style={styles.shippingIcon}>
            <Ionicons name="car" size={22} color="white" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.shippingTitle}>
              {shipping === 0 ? "Miễn phí vận chuyển" : "Phí vận chuyển: 30.000đ"}
            </Text>
            <Text style={styles.shippingSub}>
              {shipping === 0
                ? "🎉 Bạn được miễn phí ship"
                : `Mua thêm ${formatPrice(500000 - subtotal)} để freeship`}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Section */}
      <View style={styles.checkoutBox}>
        <View style={{ gap: 8 }}>
          <Row label="Tạm tính" value={formatPrice(subtotal)} />
          <Row label="Phí vận chuyển" value={shipping === 0 ? "Miễn phí" : formatPrice(shipping)} />
          {discount > 0 && (
            <Row label="Giảm giá" value={"-" + formatPrice(discount)} color="#16a34a" />
          )}

          <View style={styles.totalLine}>
            <Text style={{ fontSize: 18 }}>Tổng cộng</Text>
            <Text style={styles.totalFinal}>{formatPrice(total)}</Text>
          </View>
        </View>

        {/* 3. NÚT BẤM DÙNG ROUTER ĐÃ KHAI BÁO Ở TRÊN */}
        <TouchableOpacity 
          style={styles.payBtn}
          onPress={() => {
            router.push({
              pathname: "/CheckoutScreen", 
              params: { 
                totalAmount: total, 
                count: items.length 
              }
            });
          }}
        >
          <Text style={styles.payBtnText}>Thanh toán • {formatPrice(total)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({ label, value, color }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, color && { color }]}>{value}</Text>
    </View>
  );
}

// ... PHẦN STYLES GIỮ NGUYÊN NHƯ CŨ ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: "#4f46e5",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { color: "white", fontSize: 26, marginBottom: 4 },
  headerSub: { color: "#dbeafe" },
  headerSummary: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  headerSummaryText: { color: "white", fontSize: 12 },
  headerSummaryPrice: { color: "white", fontSize: 16 },
  itemCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 18,
  },
  outOfStockLayer: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(239,68,68,0.8)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  itemName: { fontSize: 14, marginBottom: 4 },
  itemColor: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  itemPrice: { fontSize: 18, color: "#2563eb" },
  qtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 12,
    paddingTop: 12,
  },
  qtyLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { width: 40, textAlign: "center", fontSize: 18 },
  totalLabel: { fontSize: 12, color: "#6b7280" },
  totalValue: { fontSize: 16, color: "#2563eb" },
  voucherBox: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#93c5fd",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  voucherApplied: {
    backgroundColor: "#10b981",
    borderWidth: 0,
  },
  voucherIconWrap: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
  },
  voucherIconApplied: { backgroundColor: "rgba(255,255,255,0.2)" },
  voucherTitle: { fontSize: 16, color: "#111827" },
  voucherSub: { fontSize: 12, color: "#6b7280" },
  shippingBox: {
    marginTop: 16,
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shippingIcon: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 14,
  },
  shippingTitle: { fontSize: 14 },
  shippingSub: { fontSize: 12, color: "#6b7280" },
  checkoutBox: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "white",
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { fontSize: 14, color: "#6b7280" },
  rowValue: { fontSize: 14 },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#e5e7eb",
    paddingTop: 12,
  },
  totalFinal: { fontSize: 22, color: "#2563eb", fontWeight: "bold" },
  payBtn: {
    backgroundColor: "#4f46e5",
    padding: 16,
    borderRadius: 16,
    marginTop: 14,
  },
  payBtnText: { color: "white", textAlign: "center", fontSize: 18 },
});