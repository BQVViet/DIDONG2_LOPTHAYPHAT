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

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dữ liệu mỗi khi người dùng quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem('user_orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.error("Lỗi load lịch sử đơn hàng:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  // Logic lọc đơn hàng dựa trên Tab (Chuyển đổi status tiếng Việt sang key tương ứng)
  const getStatusKey = (statusText: string) => {
    if (statusText === 'Chờ xác nhận' || statusText === 'processing') return 'processing';
    if (statusText === 'Đang giao' || statusText === 'shipping') return 'shipping';
    if (statusText === 'Đã giao' || statusText === 'delivered') return 'delivered';
    if (statusText === 'Đã hủy' || statusText === 'cancelled') return 'cancelled';
    return 'processing';
  };

  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => getStatusKey(order.status) === selectedTab);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* THAY THẾ LINEAR GRADIENT BẰNG VIEW THƯỜNG */}
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'processing', label: 'Đang xử lý' },
            { id: 'shipping', label: 'Giao hàng' },
            { id: 'delivered', label: 'Hoàn thành' },
            { id: 'cancelled', label: 'Đã hủy' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSelectedTab(tab.id)}
              style={[
                styles.tabItem,
                selectedTab === tab.id ? styles.tabActive : styles.tabInactive
              ]}
            >
              <Text style={[
                styles.tabText,
                { color: selectedTab === tab.id ? '#4F46E5' : 'white' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
            <TouchableOpacity key={order.orderId || index} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderIdText}>Mã: {order.orderId || order.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: order.status === 'Đã hủy' ? '#fee2e2' : '#e0e7ff' }]}>
                   <Text style={[styles.statusText, { color: order.status === 'Đã hủy' ? '#ef4444' : '#4f46e5' }]}>
                     {order.status || 'Đang xử lý'}
                   </Text>
                </View>
              </View>

              {/* Hiển thị danh sách sản phẩm trong đơn hàng */}
              {order.items.map((item: any, idx: number) => (
                <View key={idx} style={styles.productItem}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.productMeta}>Số lượng: {item.finalQty || item.quantity}</Text>
                    <Text style={styles.productPrice}>{formatPrice(item.finalPrice || item.price)}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.orderFooter}>
                <Text style={styles.dateText}>{order.date || order.createdAt}</Text>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Tổng thanh toán: </Text>
                  <Text style={styles.totalValue}>{formatPrice(order.total || order.totalAmount)}</Text>
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