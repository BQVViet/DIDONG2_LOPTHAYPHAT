import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Các Interface giữ nguyên như cũ ---
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'shipping' | 'processing' | 'cancelled';
  statusText: string;
  total: number;
  items: OrderItem[];
}

const orders: Order[] = [
  {
    id: 'ORD-2024-001',
    date: '23/12/2024',
    status: 'delivered',
    statusText: 'Đã giao hàng',
    total: 29990000,
    items: [
      {
        id: 1,
        name: 'iPhone 15 Pro Max 256GB',
        quantity: 1,
        price: 29990000,
        image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=500',
      },
    ],
  },
];

export default function OrderHistoryScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all');

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedTab);

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
            { id: 'processing', label: 'Xử lý' },
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

      <ScrollView contentContainerStyle={styles.listContainer}>
         {/* Nội dung danh sách đơn hàng (giống như code trước) */}
         {filteredOrders.map(order => (
             <View key={order.id} style={styles.orderCard}>
                 {/* ... content ... */}
             </View>
         ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#4F46E5', // Sử dụng màu đặc thay cho Gradient
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
  listContainer: { padding: 16 },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
});