import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../app/firebase/firebaseConfig";

export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, []);

  const loadOrderDetail = async () => {
    try {
      if (!orderId) return;

      const docRef = doc(db, "orders", orderId as string);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    } catch (err) {
      console.error("Lỗi load order detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number = 0) =>
    price.toLocaleString("vi-VN") + "đ";

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Đang xử lý";
      case "SHIPPING":
        return "Đang giao";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Đang xử lý";
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* STATUS */}
        <View style={styles.card}>
          <Text style={styles.label}>Trạng thái</Text>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>

        {/* ADDRESS - ĐÃ SỬA ĐỂ ĂN HẾT THÔNG TIN */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="location-outline" size={18} color="#64748b" style={{ marginRight: 6 }} />
            <Text style={styles.label}>Địa chỉ nhận hàng</Text>
          </View>
          
          <Text style={styles.bold}>{order.address?.fullName}</Text>
          <Text style={{ color: "#475569", marginVertical: 2 }}>{order.address?.phone}</Text>
          
          {/* Nối các trường địa chỉ lại nếu dữ liệu tồn tại */}
          <Text style={{ marginTop: 4, lineHeight: 20, color: "#1e293b" }}>
            {order.address?.street}
            {order.address?.ward ? `, ${order.address.ward}` : ""}
            {order.address?.district ? `, ${order.address.district}` : ""}
            {order.address?.city ? `, ${order.address.city}` : ""}
            {/* Dự phòng nếu địa chỉ lưu kiểu cũ (chuỗi đơn) */}
            {!order.address?.street && order.address?.address ? order.address.address : ""}
          </Text>
        </View>

        {/* PRODUCTS */}
        <View style={styles.card}>
          <Text style={styles.label}>Sản phẩm</Text>

          {order.items.map((item: any, index: number) => (
            <View key={index} style={styles.productRow}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bold}>{item.name}</Text>
                <Text>Số lượng: {item.quantity}</Text>
                <Text style={styles.price}>
                  {formatPrice(item.price)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* PAYMENT */}
        <View style={styles.card}>
          <Text style={styles.label}>Thanh toán</Text>
          <View style={styles.rowBetween}>
            <Text>Phương thức</Text>
            <Text style={styles.bold}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text>Tổng tiền</Text>
            <Text style={styles.total}>
              {formatPrice(order.totalPrice)}
            </Text>
          </View>
        </View>

        {/* DATE */}
        <View style={styles.card}>
          <Text style={styles.label}>Thời gian đặt hàng</Text>
          <Text>
            {order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleString("vi-VN")
              : ""}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ===== HEADER ===== */
  header: {
   flexDirection: "row",
   alignItems: "center",
   paddingHorizontal: 16,
   paddingTop: 40,   // 👈 đẩy header xuống
   paddingBottom: 12,
   backgroundColor: "#FFFFFF",
   borderBottomWidth: 1,
   borderBottomColor: "#E5E7EB",
},

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
  },

  /* ===== CARD ===== */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  label: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 6,
  },

  bold: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },

  /* ===== STATUS ===== */
  statusText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4F46E5",
    marginTop: 2,
  },

  /* ===== PRODUCT ===== */
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#F1F5F9",
  },

  price: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },

  /* ===== PAYMENT ===== */
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  total: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ef4444",
  },
});
