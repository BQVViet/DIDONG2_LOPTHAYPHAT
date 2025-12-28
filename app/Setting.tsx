import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PRIMARY_COLOR = '#4f46e5'; // Indigo color từ gradient web

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotif: true,
    smsNotif: false,
    darkMode: false,
    autoUpdate: true,
    saveData: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsGroups = [
    {
      title: 'Thông báo',
      items: [
        { id: 'notifications', icon: 'notifications-outline', label: 'Thông báo đẩy', desc: 'Nhận thông báo đơn hàng', type: 'toggle', color: '#3b82f6' },
        { id: 'emailNotif', icon: 'mail-outline', label: 'Email thông báo', desc: 'Nhận thông báo qua email', type: 'toggle', color: '#a855f7' },
        { id: 'smsNotif', icon: 'chatbox-ellipses-outline', label: 'SMS thông báo', desc: 'Nhận thông báo qua tin nhắn', type: 'toggle', color: '#10b981' },
      ],
    },
    {
      title: 'Giao diện',
      items: [
        { id: 'darkMode', icon: 'moon-outline', label: 'Chế độ tối', desc: 'Bật chế độ giao diện tối', type: 'toggle', color: '#374151' },
        { id: 'language', icon: 'globe-outline', label: 'Ngôn ngữ', desc: 'Tiếng Việt', type: 'navigation', color: '#f97316' },
      ],
    },
    {
      title: 'Ứng dụng',
      items: [
        { id: 'autoUpdate', icon: 'sync-outline', label: 'Tự động cập nhật', desc: 'Cập nhật phiên bản mới', type: 'toggle', color: '#14b8a6' },
        { id: 'saveData', icon: 'shield-checkmark-outline', label: 'Tiết kiệm dữ liệu', desc: 'Giảm tải ảnh chất lượng cao', type: 'toggle', color: '#6366f1' },
      ],
    },
    {
      title: 'Hỗ trợ',
      items: [
        { id: 'help', icon: 'help-circle-outline', label: 'Trung tâm trợ giúp', desc: 'Câu hỏi thường gặp', type: 'navigation', color: '#eab308' },
        { id: 'about', icon: 'information-circle-outline', label: 'Về ứng dụng', desc: 'Phiên bản 1.0.0', type: 'navigation', color: '#ec4899' },
      ],
    },
  ];

  const renderIcon = (name: string, color: string) => (
    <View style={[styles.iconBg, { backgroundColor: color }]}>
      <Ionicons name={name as any} size={20} color="white" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Cài đặt</Text>
            <Text style={styles.headerSubtitle}>Tùy chỉnh ứng dụng của bạn</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, iIdx) => (
                <View key={item.id}>
                  <View style={styles.settingItem}>
                    {renderIcon(item.icon, item.color)}
                    
                    <View style={styles.textContainer}>
                      <Text style={styles.label}>{item.label}</Text>
                      <Text style={styles.description}>{item.desc}</Text>
                    </View>

                    {item.type === 'toggle' ? (
                      <Switch
                        trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                        thumbColor={settings[item.id as keyof typeof settings] ? '#3b82f6' : '#f4f3f4'}
                        onValueChange={() => toggleSetting(item.id as keyof typeof settings)}
                        value={settings[item.id as keyof typeof settings]}
                      />
                    ) : (
                      <TouchableOpacity onPress={() => {}}>
                        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                      </TouchableOpacity>
                    )}
                  </View>
                  {iIdx < group.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.versionText}>MyApp Version 1.0.0</Text>
      </ScrollView>
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12, marginRight: 15 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#e0e7ff', fontSize: 13 },
  
  scrollContent: { padding: 20 },
  groupContainer: { marginBottom: 25 },
  groupTitle: { fontSize: 17, fontWeight: 'bold', color: '#1e293b', marginBottom: 12, marginLeft: 5 },
  groupCard: { backgroundColor: 'white', borderRadius: 24, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 15 },
  label: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: 2 },
  description: { fontSize: 12, color: '#94a3b8' },
  
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 70 },
  versionText: { textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 10, marginBottom: 30 },
});