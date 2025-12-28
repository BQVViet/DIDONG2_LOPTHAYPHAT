import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Animated,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5, 
  Entypo 
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const initialPaymentMethods = [
  {
    id: 1,
    name: 'Visa',
    number: '**** **** **** 1234',
    expiry: '12/25',
    isDefault: true,
  },
  {
    id: 2,
    name: 'Mastercard',
    number: '**** **** **** 5678',
    expiry: '06/26',
    isDefault: false,
  },
];

const otherMethods = [
  { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '🏦' },
  { id: 'momo', name: 'Ví MoMo', icon: '📱' },
  { id: 'zalopay', name: 'ZaloPay', icon: '💰' },
  { id: 'cod', name: 'Thanh toán khi nhận hàng', icon: '💵' },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formAnim] = useState(new Animated.Value(0));

  const toggleForm = () => {
    const toValue = showAddForm ? 0 : 1;
    Animated.timing(formAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowAddForm(!showAddForm);
  };

  const setDefault = (id: number) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
  };

  const deleteMethod = (id: number) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  const formHeight = formAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Chiều cao tối đa của form
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Thanh toán</Text>
            <Text style={styles.headerSubtitle}>Quản lý phương thức thanh toán</Text>
          </View>
          <TouchableOpacity 
            onPress={toggleForm}
            style={styles.addButton}
          >
            <Ionicons name={showAddForm ? "close" : "add"} size={28} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ADD CARD FORM */}
        <Animated.View style={[styles.addForm, { height: formHeight, opacity: formAnim }]}>
          <Text style={styles.formTitle}>Thêm thẻ mới</Text>
          <TextInput 
            placeholder="Số thẻ" 
            placeholderTextColor="#94a3b8"
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput 
            placeholder="Tên chủ thẻ" 
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <View style={styles.row}>
            <TextInput 
              placeholder="MM/YY" 
              placeholderTextColor="#94a3b8"
              style={[styles.input, { flex: 1, marginRight: 10 }]}
            />
            <TextInput 
              placeholder="CVV" 
              placeholderTextColor="#94a3b8"
              style={[styles.input, { flex: 1 }]}
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={toggleForm}>
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={toggleForm}>
              <Text style={styles.submitBtnText}>Thêm thẻ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* SAVED CARDS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thẻ đã lưu</Text>
          {paymentMethods.map((method) => (
            <View 
              key={method.id} 
              style={[
                styles.card, 
                method.isDefault && styles.defaultCardRing
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardType}>{method.name}</Text>
                  <Text style={styles.cardNumber}>{method.number}</Text>
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Mặc định</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.expiryLabel}>Hết hạn</Text>
                  <Text style={styles.expiryValue}>{method.expiry}</Text>
                </View>
                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <TouchableOpacity 
                      onPress={() => setDefault(method.id)}
                      style={styles.actionBtn}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    onPress={() => deleteMethod(method.id)}
                    style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                  >
                    <Ionicons name="trash-outline" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* OTHER METHODS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức khác</Text>
          <View style={styles.otherMethodsList}>
            {otherMethods.map((method, index) => (
              <TouchableOpacity 
                key={method.id} 
                style={[
                  styles.methodItem,
                  index !== otherMethods.length - 1 && styles.borderBottom
                ]}
              >
                <View style={styles.methodIconBg}>
                  <Text style={{ fontSize: 20 }}>{method.icon}</Text>
                </View>
                <Text style={styles.methodName}>{method.name}</Text>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECURITY NOTICE */}
        <View style={styles.securityNotice}>
          <View style={styles.securityIcon}>
            <MaterialCommunityIcons name="shield-check" size={24} color="white" />
          </View>
          <View style={styles.securityTextContent}>
            <Text style={styles.securityTitle}>Bảo mật thông tin</Text>
            <Text style={styles.securityDesc}>
              Thông tin thẻ của bạn được mã hóa tuyệt đối. Chúng tôi không lưu trữ mã CVV.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 8 },
  headerText: { flex: 1, marginLeft: 15 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#e0e7ff', fontSize: 13, opacity: 0.8 },
  addButton: { backgroundColor: 'white', padding: 10, borderRadius: 20, elevation: 5 },
  
  addForm: { overflow: 'hidden', backgroundColor: 'white', borderRadius: 24, marginBottom: 20, paddingHorizontal: 15 },
  formTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 15, color: '#1e293b' },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 15, marginBottom: 12, color: '#1e293b' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, backgroundColor: '#e2e8f0', padding: 15, borderRadius: 15, marginRight: 10, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: '600' },
  submitBtn: { flex: 1, backgroundColor: '#4F46E5', padding: 15, borderRadius: 15, alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: '600' },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  
  card: { 
    backgroundColor: '#6366f1', 
    borderRadius: 25, 
    padding: 20, 
    marginBottom: 15,
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  defaultCardRing: { borderWidth: 3, borderColor: '#a5b4fc' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  cardType: { color: '#e0e7ff', fontSize: 14, marginBottom: 4 },
  cardNumber: { color: 'white', fontSize: 20, letterSpacing: 2, fontWeight: 'bold' },
  defaultBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  defaultBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  expiryLabel: { color: '#e0e7ff', fontSize: 10, marginBottom: 2 },
  expiryValue: { color: 'white', fontSize: 16, fontWeight: '600' },
  cardActions: { flexDirection: 'row' },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, marginLeft: 8 },

  otherMethodsList: { backgroundColor: 'white', borderRadius: 25, overflow: 'hidden', elevation: 2 },
  methodItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  methodIconBg: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 15, marginRight: 15 },
  methodName: { flex: 1, fontSize: 15, color: '#1e293b' },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },

  securityNotice: { backgroundColor: '#eff6ff', borderRadius: 25, padding: 20, flexDirection: 'row', alignItems: 'center' },
  securityIcon: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 18, marginRight: 15 },
  securityTextContent: { flex: 1 },
  securityTitle: { color: '#1e3a8a', fontWeight: 'bold', marginBottom: 4 },
  securityDesc: { color: '#1d4ed8', fontSize: 12, lineHeight: 18 },
});