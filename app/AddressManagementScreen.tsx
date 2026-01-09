


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

  // HÀM MỚI: Chọn địa chỉ và truyền về Checkout
  const handleSelectAddress = (addressItem: typeof initialAddresses[0]) => {
    router.push({
      pathname: "/CheckoutScreen" as any, // Hãy đảm bảo đường dẫn này đúng với cấu trúc file của bạn
      params: {
        selectedName: addressItem.fullName,
        selectedPhone: addressItem.phone,
        selectedAddress: addressItem.address
      }
    });
  };

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
          <TouchableOpacity 
            key={address.id} 
            activeOpacity={0.9} 
            onPress={() => handleSelectAddress(address)} // Thêm sự kiện chọn địa chỉ
          >
            <View 
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

            
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' }, // Màu nền Slate 50 nhẹ nhàng hơn
    
    // HEADER
    header: {
      backgroundColor: '#059669',
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'ios' ? 10 : 40,
      paddingBottom: 35,
      borderBottomLeftRadius: 32, // Bo góc tinh tế hơn
      borderBottomRightRadius: 32,
      shadowColor: '#059669',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 15,
      elevation: 15,
      zIndex: 10,
    },
    headerContent: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    backButton: { 
      backgroundColor: 'rgba(255,255,255,0.2)', 
      padding: 10, 
      borderRadius: 16, 
      borderWidth: 1, 
      borderColor: 'rgba(255,255,255,0.1)' 
    },
    headerTitle: { 
      color: 'white', 
      fontSize: 20,
     
      fontWeight: '800', 
      letterSpacing: -0.5 
    },
    headerSubtitle: { 
      color: '#D1FAE5', 
      fontSize: 13, 
      fontWeight: '500', 
      opacity: 0.9, 
      marginTop: 2 
    },
    addButton: { 
      backgroundColor: 'white', 
      width: 48, 
      height: 48, 
      borderRadius: 16, 
      justifyContent: 'center', 
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,

    },

    // SCROLL CONTAINER
    scrollContainer: { 
      paddingHorizontal: 16, 
      paddingTop: 20, 
      paddingBottom: 40 
    },

    // FORM THÊM MỚI
    addForm: { 
      backgroundColor: 'white', 
      borderRadius: 24, 
      padding: 20, 
      marginBottom: 24,
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 15,

      borderWidth: 1,
      borderColor: '#F1F5F9'
    },
    formTitle: { 
      fontSize: 18, 
      fontWeight: '800', 
      color: '#1E293B', 
      marginBottom: 16 
    },
    input: { 
      backgroundColor: '#F1F5F9', 
      borderRadius: 14, 
      paddingHorizontal: 16, 
      paddingVertical: 12, 
      fontSize: 15, 
      color: '#1E293B', 
      marginBottom: 12, 
      borderWidth: 1, 
      borderColor: '#E2E8F0' 
    },
    textArea: { height: 80, textAlignVertical: 'top' },
    formActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
    cancelBtn: { 
      flex: 1, 
      backgroundColor: '#F1F5F9', 
      paddingVertical: 14, 
      borderRadius: 14, 
      alignItems: 'center' 
    },
    cancelBtnText: { color: '#64748B', fontWeight: '700' },
    saveBtn: { 
      flex: 1, 
      backgroundColor: '#059669', 
      paddingVertical: 14, 
      borderRadius: 14, 
      alignItems: 'center' 
    },
    saveBtnText: { color: 'white', fontWeight: '700' },

    // CARD ĐỊA CHỈ
    addressCard: { 
      backgroundColor: 'white', 
      borderRadius: 24, 
      padding: 18, 
      marginBottom: 16, 
      borderWidth: 1.5, 
      borderColor: 'transparent',
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3 
    },
    defaultCard: { 
      borderColor: '#059669', 
      backgroundColor: '#FFFFFF',
      shadowColor: '#059669',
      shadowOpacity: 0.1
    },
    cardHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      marginBottom: 14 
    },
    cardHeaderLeft: { flexDirection: 'row', gap: 12, flex: 1 },
    iconCircle: { 
      width: 40, 
      height: 40, 
      backgroundColor: '#F0FDFA', 
      borderRadius: 12, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addressName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    defaultBadge: { 
      backgroundColor: '#059669', 
      paddingHorizontal: 8, 
      paddingVertical: 3, 
      borderRadius: 8 
    },
    defaultBadgeText: { 
      color: 'white', 
      fontSize: 9, 
      fontWeight: '900', 
      textTransform: 'uppercase' 
    },
    userNameText: { 
      color: '#64748B', 
      fontSize: 14, 
      marginTop: 2, 
      fontWeight: '600' 
    },

    // ACTIONS
    actionButtons: { flexDirection: 'row', gap: 8 },
    editBtn: { backgroundColor: '#F0F7FF', padding: 8, borderRadius: 10 },
    deleteBtn: { backgroundColor: '#FFF1F2', padding: 8, borderRadius: 10 },

    // BOX THÔNG TIN CHI TIẾT
    addressInfoBox: { 
      backgroundColor: '#F8FAFC', 
      borderRadius: 16, 
      padding: 14, 
      marginBottom: 14, 
      borderWidth: 1, 
      borderColor: '#F1F5F9' 
    },
    addressText: { 
      color: '#475569', 
      fontSize: 14, 
      lineHeight: 20, 
      marginBottom: 6, 
      fontWeight: '500' 
    },
    phoneText: { 
      color: '#1E293B', 
      fontSize: 14, 
      fontWeight: '700',
      letterSpacing: 0.2
    },

    // NÚT ĐẶT MẶC ĐỊNH
    setAsDefaultBtn: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#F0FDFA', 
      paddingVertical: 12, 
      borderRadius: 14, 
      gap: 8, 
      borderWidth: 1, 
      borderColor: '#05966933' // Opacity 20%
    },
    setAsDefaultText: { 
      color: '#059669', 
      fontWeight: '700', 
      fontSize: 14 
    },
  });