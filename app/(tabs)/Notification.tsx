import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const PRIMARY_COLOR = '#ea580c';

export default function Notification() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'unread'>('all');

  const userId = 'USER_001'; // Thay bằng ID thực tế từ Auth

  // Lắng nghe thông báo Realtime
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        // Chuyển Firebase Timestamp sang String hiển thị
        timeDisplay: d.data().createdAt?.toDate() 
          ? d.data().createdAt.toDate().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) + ' ' + 
            d.data().createdAt.toDate().toLocaleDateString('vi-VN')
          : 'Vừa xong'
      }));
      setNotifs(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (item: any) => {
    if (!item.read) {
      await updateDoc(doc(db, 'notifications', item.id), { read: true });
    }
    // Nếu là thông báo đơn hàng, bấm vào dẫn tới chi tiết đơn
    if (item.orderId) {
      router.push({ pathname: "/OrderDetailScreen", params: { orderId: item.orderId } } as any);
    }
  };

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifs.forEach(n => {
      if (!n.read) {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      }
    });
    await batch.commit();
  };

  const filteredNotifs = selectedTab === 'all' ? notifs : notifs.filter(n => !n.read);
  const unreadCount = notifs.filter(n => !n.read).length;

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
      onPress={() => markAsRead(item)}
      style={[styles.notifCard, !item.read && styles.unreadCard]}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.bgColor || '#64748b' }]}>
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
        <Text style={styles.notifTime}>{item.timeDisplay}</Text>
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
              <Text style={styles.headerSubtitle}>{unreadCount} tin mới</Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Đọc tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabContainer}>
          {['all', 'unread'].map((t) => (
            <TouchableOpacity 
              key={t}
              onPress={() => setSelectedTab(t as any)}
              style={[styles.tab, selectedTab === t && styles.activeTab]}
            >
              <Text style={[styles.tabText, selectedTab === t && styles.activeTabText]}>
                {t === 'all' ? 'Tất cả' : 'Chưa đọc'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredNotifs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyText}>Bạn không có thông báo nào</Text>
            </View>
          }
        />
      )}
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
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  unreadCard: { borderWidth: 1, borderColor: '#fdba74', backgroundColor: '#fffaf5' },
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