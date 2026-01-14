import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load lại mỗi khi quay về màn
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  

  // ================= FIREBASE FETCH =================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(fetchedOrders);

    } catch (error) {
      console.error("Lỗi load orders Firebase:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatPrice = (price: number = 0) =>
    price.toLocaleString('vi-VN') + 'đ';

  // ================= STATUS MAP =================
  const getStatusKey = (status: string) => {
    switch (status) {
      case "PENDING":
        return "processing";
      case "SHIPPING":
        return "shipping";
      case "COMPLETED":
        return "delivered";
      case "CANCELLED":
        return "cancelled";
      default:
        return "processing";
    }
  };

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

  const filteredOrders =
    selectedTab === 'all'
      ? orders
      : orders.filter(order => getStatusKey(order.status) === selectedTab);

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // ================= UI =================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
            <Text style={styles.headerSubTitle}>{orders.length} đơn hàng đã đặt</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'processing', label: 'Đang xử lý' },
            { id: 'shipping', label: 'Giao hàng' },
            { id: 'delivered', label: 'Hoàn thành' },
            { id: 'cancelled', label: 'Đã hủy' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSelectedTab(tab.id)}
              style={[
                styles.tabItem,
                selectedTab === tab.id ? styles.tabActive : styles.tabInactive
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: selectedTab === tab.id ? '#4F46E5' : 'white' }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={80} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không tìm thấy đơn hàng nào</Text>
          </View>
          
        ) : (
          filteredOrders.map((order, index) => (
            <TouchableOpacity key={order.id || index} style={styles.orderCard}>
               <TouchableOpacity
              key={order.id || index}
              style={styles.orderCard}
              onPress={() =>
                router.push({
                  pathname: '/OrderDetailScreen' as any ,
                  params: { orderId: order.id },
                })
              }
            ></TouchableOpacity>
              <View style={styles.orderHeader}>
                <Text style={styles.orderIdText}>Mã: {order.id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>

              {/* ITEMS */}
              {order.items?.map((item: any, idx: number) => (
                <View key={idx} style={styles.productItem}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.productMeta}>
                      Số lượng: {item.quantity}
                    </Text>
                    <Text style={styles.productPrice}>
                      {formatPrice(item.price)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.orderFooter}>
                <Text style={styles.dateText}>
                  {order.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleDateString("vi-VN")
                    : ""}
                </Text>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Tổng: </Text>
                  <Text style={styles.totalValue}>
                    {formatPrice(order.totalPrice)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
    marginRight: 15,
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubTitle: { color: '#e0e7ff', fontSize: 13, opacity: 0.9 },
  tabsScroll: { flexDirection: 'row' },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  tabActive: { backgroundColor: 'white' },
  tabInactive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  tabText: { fontSize: 14, fontWeight: '700' },
  listContainer: { padding: 16, flexGrow: 1 },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
  orderIdText: { fontWeight: 'bold', color: '#64748b', fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  productItem: { flexDirection: 'row', marginBottom: 12 },
  productImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#f1f5f9' },
  productInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  productName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  productMeta: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#4f46e5', marginTop: 2 },
  orderFooter: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, marginTop: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 12, color: '#94a3b8' },
  totalContainer: { flexDirection: 'row', alignItems: 'center' },
  totalLabel: { fontSize: 12, color: '#64748b' },
  totalValue: { fontSize: 16, fontWeight: '900', color: '#4f46e5' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94a3b8', marginTop: 10, fontSize: 16 },
});