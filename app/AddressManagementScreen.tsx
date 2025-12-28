import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  StatusBar,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Kích hoạt LayoutAnimation cho Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const initialAddresses = [
  {
    id: 1,
    name: 'Nhà riêng',
    fullName: 'Nguyễn Văn A',
    phone: '+84 912 345 678',
    address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    isDefault: true,
  },
  {
    id: 2,
    name: 'Văn phòng',
    fullName: 'Nguyễn Văn A',
    phone: '+84 912 345 678',
    address: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    isDefault: false,
  },
];

export default function AddressManagementScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(false);

  // Toggle form với hiệu ứng mượt
  const toggleAddForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAddForm(!showAddForm);
  };

  const setDefault = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  const deleteAddress = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Header - Màu phẳng (Solid) để tránh lỗi thư viện Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
              <Text style={styles.headerSubtitle}>{addresses.length} địa chỉ đã lưu</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={toggleAddForm}
          >
            <Ionicons name={showAddForm ? "close" : "add"} size={28} color="#059669" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        {/* Form thêm địa chỉ mới */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Thêm địa chỉ mới</Text>
            <TextInput style={styles.input} placeholder="Họ và tên" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} placeholder="Số điện thoại" keyboardType="phone-pad" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} placeholder="Tên địa chỉ (Nhà, Văn phòng...)" placeholderTextColor="#94a3b8" />
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Địa chỉ chi tiết" 
              multiline 
              numberOfLines={3} 
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={toggleAddForm}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={toggleAddForm}>
                <Text style={styles.saveBtnText}>Lưu địa chỉ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Danh sách địa chỉ */}
        {addresses.map((address) => (
          <View 
            key={address.id} 
            style={[
              styles.addressCard,
              address.isDefault && styles.defaultCard
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="location" size={20} color="#059669" />
                </View>
                <View>
                  <View style={styles.nameRow}>
                    <Text style={styles.addressName}>{address.name}</Text>
                    {address.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userNameText}>{address.fullName}</Text>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editBtn}>
                  <Ionicons name="create-outline" size={20} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteAddress(address.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.addressInfoBox}>
              <Text style={styles.addressText}>{address.address}</Text>
              <Text style={styles.phoneText}>{address.phone}</Text>
            </View>

            {!address.isDefault && (
              <TouchableOpacity 
                style={styles.setAsDefaultBtn} 
                onPress={() => setDefault(address.id)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
                <Text style={styles.setAsDefaultText}>Đặt làm mặc định</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F1F5F9' // Màu nền xám nhạt hơn để làm nổi bật Card trắng
  },
  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 40, // Bo góc mạnh hơn tạo sự mềm mại
    borderBottomRightRadius: 40,
    // Đổ bóng Header sâu hơn
    elevation: 12,
    shadowColor: '#059669',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16 
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 22, // Tăng size chữ
    fontWeight: '800', // Chữ dày hơn
    letterSpacing: -0.5,
  },
  headerSubtitle: { 
    color: '#D1FAE5', 
    fontSize: 13, 
    opacity: 0.9,
    marginTop: 2 
  },
  addButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 16, // Chuyển từ tròn sang Squircle (bo góc vuông)
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  scrollContainer: { 
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40 
  },

  // Form Styles - Làm cho Input trông "sạch" hơn
  addForm: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  formTitle: { 
    fontSize: 19, 
    fontWeight: 'bold', 
    color: '#0F172A', 
    marginBottom: 20,
    letterSpacing: -0.5 
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9', // Thêm border mờ để định hình input
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  formActions: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 8 
  },
  cancelBtn: { 
    flex: 1, 
    backgroundColor: '#F1F5F9', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  cancelBtnText: { 
    color: '#64748B', 
    fontWeight: '700' 
  },
  saveBtn: { 
    flex: 1, 
    backgroundColor: '#059669', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center',
    elevation: 4,
  },
  saveBtnText: { 
    color: 'white', 
    fontWeight: '700' 
  },

  // Card Styles - Tăng độ tương phản
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  defaultCard: {
    borderColor: '#059669', // Hiện rõ viền xanh khi mặc định
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: { 
    flexDirection: 'row', 
    gap: 14, 
    flex: 1 
  },
  iconCircle: {
    width: 44,
    height: 44,
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    flexWrap: 'wrap' 
  },
  addressName: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#0F172A' 
  },
  defaultBadge: { 
    backgroundColor: '#059669', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 10 
  },
  defaultBadgeText: { 
    color: 'white', 
    fontSize: 10, 
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  userNameText: { 
    color: '#64748B', 
    fontSize: 14, 
    marginTop: 4,
    fontWeight: '500'
  },
  
  actionButtons: { 
    flexDirection: 'row', 
    gap: 10 
  },
  editBtn: { 
    backgroundColor: '#EFF6FF', 
    padding: 10, 
    borderRadius: 12 
  },
  deleteBtn: { 
    backgroundColor: '#FEF2F2', 
    padding: 10, 
    borderRadius: 12 
  },

  addressInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  addressText: { 
    color: '#334155', 
    fontSize: 15, 
    lineHeight: 22, 
    marginBottom: 8,
    fontWeight: '400' 
  },
  phoneText: { 
    color: '#1E293B', 
    fontSize: 14,
    fontWeight: '600' // Làm số điện thoại nổi bật hơn
  },

  setAsDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  setAsDefaultText: { 
    color: '#059669', 
    fontWeight: '700', 
    fontSize: 15 
  },
});