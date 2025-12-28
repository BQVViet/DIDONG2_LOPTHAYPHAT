import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  MaterialIcons 
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type Screen = 'orders' | 'addresses' | 'payment-methods' | 'reviews' | 'wishlist' | 'notifications' | 'vouchers' | 'settings';

interface ProfileProps {
  onNavigate?: (screen: Screen) => void;
  ordersCount?: number;
  addressesCount?: number;
  paymentMethodsCount?: number;
  reviewsCount?: number;
}

export default function ProfileScreen({ 
  onNavigate = () => {}, 
  ordersCount = 0,
  addressesCount = 0,
  paymentMethodsCount = 0,
  reviewsCount = 0,
}: ProfileProps) {
  const router = useRouter();
  
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const idToken = await AsyncStorage.getItem('idToken');

      if (!idToken) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCDf0L31c7ZYq2HolzIxfKIsC9BIEUHgBo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );

      const data = await response.json();

      if (data.users && data.users[0]) {
        const u = data.users[0];
        setUser({
          name: u.displayName || u.email.split('@')[0],
          email: u.email,
          avatarUrl: u.photoUrl,
        });
        
        startAnimations();
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('idToken');
      router.replace('/(auth)/login');
    } catch (e) {
      console.error(e);
    }
  };

  const renderIcon = (lib: string, name: string, color: string) => {
    const size = 20;
    if (lib === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    if (lib === 'Ionicons') return <Ionicons name={name as any} size={size} color={color} />;
    if (lib === 'FontAwesome5') return <FontAwesome5 name={name as any} size={16} color={color} />;
    if (lib === 'MaterialIcons') return <MaterialIcons name={name as any} size={size} color={color} />;
    return null;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.avatarWrapper}>
               {user?.avatarUrl ? (
                 <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
               ) : (
                 <FontAwesome5 name="user-alt" size={30} color="#4F46E5" />
               )}
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{user?.name}</Text>
                <View style={styles.vipBadge}>
                  <FontAwesome5 name="crown" size={8} color="#fff" />
                  <Text style={styles.vipText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.userSubText}>{user?.email}</Text>
            </View>
            <TouchableOpacity style={styles.settingsIcon} onPress={() => console.log('Edit Profile')}>
                <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* QUICK STATS */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
               <View style={[styles.statIconBg, { backgroundColor: '#f59e0b' }]}><FontAwesome5 name="award" size={12} color="#fff" /></View>
               <Text style={styles.statValue}>156</Text>
               <Text style={styles.statLabel}>Điểm</Text>
            </View>
            <View style={styles.statBox}>
               <View style={[styles.statIconBg, { backgroundColor: '#3b82f6' }]}><FontAwesome5 name="shopping-bag" size={12} color="#fff" /></View>
               <Text style={styles.statValue}>{ordersCount}</Text>
               <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>
            <View style={styles.statBox}>
               <View style={[styles.statIconBg, { backgroundColor: '#f43f5e' }]}><FontAwesome5 name="star" size={12} color="#fff" /></View>
               <Text style={styles.statValue}>{reviewsCount}</Text>
               <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
          </View>
        </View>

   
        {/* MENU TÀI KHOẢN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản của tôi</Text>
          {[
            { title: 'Đơn hàng của tôi', icon: 'package-variant-closed', lib: 'MaterialCommunityIcons', badge: ordersCount, color: '#3b82f6', desc: 'Theo dõi đơn hàng', route: '/OrderHistoryScreen' },
            { title: 'Danh sách yêu thích', icon: 'heart', lib: 'Ionicons', badge: 0, color: '#f43f5e', desc: 'Sản phẩm đã lưu', route: '/wishlist' },
            { title: 'Địa chỉ nhận hàng', icon: 'location-sharp', lib: 'Ionicons', badge: addressesCount, color: '#10b981', desc: 'Quản lý địa chỉ', route: '/AddressManagementScreen' },
            { title: 'Thanh toán', icon: 'credit-card', lib: 'FontAwesome5', badge: paymentMethodsCount, color: '#8b5cf6', desc: 'Ví và thẻ đã lưu', route: '/PaymentMethodsScreen' },
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.menuItem} 
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIconBg, { backgroundColor: item.color + '15' }]}>
                {renderIcon(item.lib, item.icon, item.color)}
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDesc}>{item.desc}</Text>
              </View>
              {Boolean(item.badge && item.badge > 0) && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{String(item.badge)}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* CÀI ĐẶT */}
        <View style={[styles.section, { marginBottom: 20 }]}>
          <Text style={styles.sectionTitle}>Cài đặt hệ thống</Text>
          {[
            { title: 'Thông báo', icon: 'notifications', lib: 'Ionicons', color: '#f59e0b', desc: 'Cài đặt nhắc nhở', route: '/NotificationScreen' },
            { title: 'Ưu đãi của tôi', icon: 'card-giftcard', lib: 'MaterialIcons', color: '#06b6d4', desc: 'Voucher khả dụng', route: '/vouchers' },
            { title: 'Tùy chỉnh', icon: 'settings', lib: 'Ionicons', color: '#64748b', desc: 'Giao diện & Bảo mật', route: '/Setting' },
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.menuItem} 
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIconBg, { backgroundColor: item.color + '15' }]}>
                {renderIcon(item.lib, item.icon, item.color)}
              </View>
              <View style={styles.menuTextContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* NÚT ĐĂNG XUẤT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <View style={styles.logoutContent}>
            <Ionicons name="log-out-outline" size={22} color="#fff" />
            <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- CSS ĐÃ ĐƯỢC TỐI ƯU ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' // Màu nền xám nhẹ dịu mắt hơn
  },
  center: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 80, // Tăng padding để membership card đè lên đẹp hơn
    paddingHorizontal: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTop: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  avatarWrapper: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  avatar: { 
    width: 68, 
    height: 68, 
    borderRadius: 22 
  },
  headerInfo: { 
    flex: 1, 
    marginLeft: 18 
  },
  nameContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  userName: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '700',
    letterSpacing: 0.5
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 10,
  },
  vipText: { 
    color: '#fff', 
    fontSize: 9, 
    fontWeight: '900', 
    marginLeft: 3 
  },
  userSubText: { 
    color: '#E0E7FF', 
    fontSize: 13, 
    opacity: 0.9 
  },
  settingsIcon: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12
  },
  
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 30 
  },
  statBox: { 
    backgroundColor: 'rgba(255,255,255,0.12)', 
    paddingVertical: 15,
    borderRadius: 22, 
    width: (width - 70) / 3, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  statIconBg: { 
    padding: 6, 
    borderRadius: 8, 
    marginBottom: 6 
  },
  statValue: { 
    color: '#fff', 
    fontSize: 17, 
    fontWeight: '700' 
  },
  statLabel: { 
    color: '#E0E7FF', 
    fontSize: 11,
    fontWeight: '500'
  },

  membershipCard: {
    backgroundColor: '#1E293B',
    marginHorizontal: 25,
    marginTop: -50,
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 12,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 18 
  },
  cardLabel: { 
    color: '#94A3B8', 
    fontSize: 10, 
    fontWeight: '800',
    letterSpacing: 1
  },
  cardRank: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 4 
  },
  cardRankText: { 
    color: '#fff', 
    fontSize: 19, 
    fontWeight: '700', 
    marginLeft: 8 
  },
  cardPoints: { 
    color: '#facc15', 
    fontSize: 18, 
    fontWeight: '800' 
  },
  progressBarBg: { 
    height: 7, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 10, 
    marginBottom: 10 
  },
  progressBarFill: { 
    height: 7, 
    backgroundColor: '#fbbf24', 
    borderRadius: 10 
  },
  cardSubText: { 
    color: '#94A3B8', 
    fontSize: 11,
    fontStyle: 'italic'
  },

  section: { 
    marginTop: 30, 
    paddingHorizontal: 25 
  },
  sectionTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#334155', 
    marginBottom: 15, 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 22,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  menuIconBg: { 
    width: 46, 
    height: 46, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  menuTextContent: { 
    flex: 1, 
    marginLeft: 15 
  },
  menuItemTitle: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1E293B' 
  },
  menuItemDesc: { 
    fontSize: 12, 
    color: '#64748B', 
    marginTop: 2 
  },
  badge: { 
    backgroundColor: '#F43F5E', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 10, 
    marginRight: 8 
  },
  badgeText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: '700' 
  },

  logoutBtn: {
    backgroundColor: '#F43F5E',
    marginHorizontal: 25,
    marginTop: 15,
    marginBottom: 50,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#F43F5E',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  logoutText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700', 
    marginLeft: 12 
  },
});