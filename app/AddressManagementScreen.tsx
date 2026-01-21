import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../app/firebase/firebaseConfig';

// Enable animation Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

/* ================= TYPE ================= */
type Address = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  createdAt?: any;
};

export default function AddressManagementScreen() {
  const router = useRouter();

  /* ================= STATE ================= */
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  /* ================= FETCH ================= */
  const fetchAddresses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'address'));

      const list: Address[] = snapshot.docs.map(d => ({
        id: d.id,
        fullName: d.data().fullName,
        phone: d.data().phone,
        email: d.data().email ?? '',
        street: d.data().street,
        ward: d.data().ward,
        district: d.data().district,
        city: d.data().city,
        isDefault: d.data().isDefault ?? false,
        createdAt: d.data().createdAt,
      }));

      // Địa chỉ mặc định lên đầu
      list.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

      setAddresses(list);
    } catch (err) {
      console.log(err);
      Alert.alert('Lỗi', 'Không tải được địa chỉ');
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  /* ================= ADD ================= */
  const addAddress = async () => {
    if (!fullName || !phone || !street || !ward || !district || !city) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ địa chỉ');
      return;
    }

    try {
      // Nếu chọn mặc định → bỏ mặc định cũ
      if (isDefault) {
        const q = query(
          collection(db, 'address'),
          where('isDefault', '==', true)
        );
        const snap = await getDocs(q);
        snap.forEach(d => updateDoc(d.ref, { isDefault: false }));
      }

      await addDoc(collection(db, 'address'), {
        fullName,
        phone,
        email,
        street,
        ward,
        district,
        city,
        isDefault,
        createdAt: serverTimestamp(),
      });

      // reset form
      setFullName('');
      setPhone('');
      setEmail('');
      setStreet('');
      setWard('');
      setDistrict('');
      setCity('');
      setIsDefault(false);
      setShowAddForm(false);

      fetchAddresses();
    } catch (err) {
      console.log(err);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ');
    }
  };

  /* ================= DELETE ================= */
  const deleteAddress = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'address', id));
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAddresses(prev => prev.filter(i => i.id !== id));
    } catch {
      Alert.alert('Lỗi', 'Không xoá được địa chỉ');
    }
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
              <Text style={styles.headerSubtitle}>
                {addresses.length} địa chỉ đã lưu
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons name={showAddForm ? 'close' : 'add'} size={28} color="#059669" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ADD FORM */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Thêm địa chỉ mới</Text>

            <TextInput style={styles.input} placeholder="Họ và tên" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Số điện thoại" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />

            <TextInput style={styles.input} placeholder="Số nhà, tên đường" value={street} onChangeText={setStreet} />
            <TextInput style={styles.input} placeholder="Phường / Xã" value={ward} onChangeText={setWard} />
            <TextInput style={styles.input} placeholder="Quận / Huyện" value={district} onChangeText={setDistrict} />
            <TextInput style={styles.input} placeholder="Tỉnh / Thành phố" value={city} onChangeText={setCity} />

            <View style={styles.defaultRow}>
              <Text style={{ fontWeight: '600' }}>Đặt làm mặc định</Text>
              <Switch value={isDefault} onValueChange={setIsDefault} />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddForm(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={addAddress}>
                <Text style={styles.saveBtnText}>Lưu địa chỉ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* LIST */}
        {addresses.map(item => (
          <TouchableOpacity 
            key={item.id} 
            activeOpacity={0.7}
            onPress={() => {
                // 🔥 GỬI DỮ LIỆU VỀ CHECKOUT SCREEN
                router.push({
                    pathname: "/CheckoutScreen" as any, 
                    params: { selectedAddress: JSON.stringify(item) }
                });
            }}
            style={[styles.addressCard, item.isDefault && styles.defaultCard]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name="location" size={20} color="#059669" />
                </View>
                <View>
                  <Text style={styles.addressName}>{item.fullName}</Text>
                  {item.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>MẶC ĐỊNH</Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={(e) => {
                    e.stopPropagation(); // Chặn không cho sự kiện click lan ra thẻ cha (không bị nhảy về Checkout khi bấm xóa)
                    deleteAddress(item.id);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.addressInfoBox}>
              <Text style={styles.addressText}>
                {item.street}, {item.ward}, {item.district}, {item.city}
              </Text>
              <Text style={styles.phoneText}>{item.phone}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLE ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 35,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  backButton: { padding: 10, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  headerSubtitle: { color: '#D1FAE5', fontSize: 13 },

  addButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContainer: { padding: 16 },

  addForm: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },

  formTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },

  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },

  defaultRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },

  formActions: { flexDirection: 'row', gap: 10 },

  cancelBtn: { flex: 1, padding: 14, backgroundColor: '#F1F5F9', borderRadius: 14 },
  cancelBtnText: { textAlign: 'center', fontWeight: '700' },

  saveBtn: { flex: 1, padding: 14, backgroundColor: '#059669', borderRadius: 14 },
  saveBtnText: { color: 'white', textAlign: 'center', fontWeight: '700' },

  addressCard: { backgroundColor: 'white', borderRadius: 24, padding: 18, marginBottom: 16 },
  defaultCard: { borderWidth: 1.5, borderColor: '#059669' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardHeaderLeft: { flexDirection: 'row', gap: 12 },

  iconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0FDFA', justifyContent: 'center', alignItems: 'center' },

  addressName: { fontWeight: '800', fontSize: 16 },

  defaultBadge: { backgroundColor: '#059669', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  defaultBadgeText: { color: 'white', fontSize: 10, fontWeight: '800' },

  deleteBtn: { padding: 10 },

  addressInfoBox: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 14, marginTop: 10 },
  addressText: { marginBottom: 6 },
  phoneText: { fontWeight: '700' },
});