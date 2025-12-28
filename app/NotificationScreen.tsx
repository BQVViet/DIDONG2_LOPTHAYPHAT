import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Màu sắc chủ đạo thay cho Gradient
const PRIMARY_COLOR = '#ea580c';

// Dữ liệu mẫu (Notification Data)
const initialNotifications = [
  {
    id: '1',
    type: 'order',
    title: 'Đơn hàng đã được giao',
    message: 'Đơn hàng #ORD-2024-001 đã được giao thành công. Cảm ơn bạn đã mua hàng!',
    time: '5 phút trước',
    icon: 'package-variant-closed',
    lib: 'MaterialCommunityIcons',
    bgColor: '#22c55e', // Màu icon thay cho gradient
    read: false,
  },
  {
    id: '2',
    type: 'promotion',
    title: 'Flash Sale đang diễn ra! 🔥',
    message: 'Giảm đến 50% cho các sản phẩm điện thoại. Nhanh tay đặt hàng!',
    time: '1 giờ trước',
    icon: 'tag',
    lib: 'FontAwesome5',
    bgColor: '#f97316',
    read: false,
  },
  {
    id: '3',
    type: 'shipping',
    title: 'Đơn hàng đang được giao',
    message: 'Đơn hàng #ORD-2024-002 đang trên đường giao đến bạn.',
    time: '2 giờ trước',
    icon: 'truck-delivery',
    lib: 'MaterialCommunityIcons',
    bgColor: '#3b82f6',
    read: true,
  },
];

export default function NotificationScreen() {
  const router = useRouter();
  const [notifs, setNotifs] = useState(initialNotifications);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');

  // Logic lọc thông báo
  const filteredNotifs = selectedTab === 'all' 
    ? notifs 
    : notifs.filter(n => !n.read);

  const unreadCount = notifs.filter(n => !n.read).length;

  // Logic đánh dấu đã đọc
  const markAsRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Hàm render Icon linh hoạt
  const renderIcon = (lib: string, name: string, color: string) => {
    switch (lib) {
      case 'MaterialCommunityIcons': return <MaterialCommunityIcons name={name as any} size={22} color={color} />;
      case 'FontAwesome5': return <FontAwesome5 name={name as any} size={20} color={color} />;
      default: return <Ionicons name={name as any} size={22} color={color} />;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => markAsRead(item.id)}
      style={[styles.notifCard, !item.read && styles.unreadCard]}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
        {renderIcon(item.lib, item.icon, 'white')}
      </View>
      
      <View style={styles.notifContent}>
        <View style={styles.notifHeaderRow}>
          <Text style={[styles.notifTitle, !item.read && styles.boldText]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerInfo}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Thông báo</Text>
              <Text style={styles.headerSubtitle}>{unreadCount} chưa đọc</Text>
            </View>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Đọc tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setSelectedTab('all')}
            style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectedTab('unread')}
            style={[styles.tab, selectedTab === 'unread' && styles.activeTab]}
          >
            <Text style={[styles.tabText, selectedTab === 'unread' && styles.activeTabText]}>Chưa đọc</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredNotifs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12, marginRight: 15 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#ffedd5', fontSize: 13 },
  markAllBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  markAllText: { color: 'white', fontSize: 12, fontWeight: '600' },
  tabContainer: { flexDirection: 'row', gap: 10 },
  tab: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  activeTab: { backgroundColor: 'white' },
  tabText: { color: 'white', fontWeight: '600' },
  activeTabText: { color: PRIMARY_COLOR },
  listContent: { padding: 20 },
  notifCard: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 24, 
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2 
  },
  unreadCard: { borderWidth: 1, borderColor: '#fdba74' },
  iconContainer: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1, marginLeft: 15 },
  notifHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: 15, color: '#475569' },
  boldText: { fontWeight: 'bold', color: '#1e293b' },
  unreadDot: { width: 8, height: 8, backgroundColor: '#ea580c', borderRadius: 4 },
  notifMessage: { fontSize: 13, color: '#64748b', marginVertical: 4 },
  notifTime: { fontSize: 11, color: '#94a3b8' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#94a3b8', fontSize: 16 }
});