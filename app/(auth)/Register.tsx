


import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 🔥 FIRESTORE
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../app/firebase/firebaseConfig";

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();



  // -------------------- VALIDATE FORM --------------------
  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name) newErrors.name = 'Vui lòng nhập tên';
    else if (name.length < 2) newErrors.name = 'Tên phải có ít nhất 2 ký tự';

    if (!email) newErrors.email = 'Vui lòng nhập email';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';

    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6)
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    if (!confirmPassword)
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Mật khẩu không khớp';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------- CREATE USER FIRESTORE --------------------
  const createUserFirestore = async (
    uid: string,
    email: string,
    name: string
  ) => {
    await setDoc(doc(db, "users", uid), {
      name: name,
      email: email,
      phone: "",
      avatarUrl: "",
      role: "user",
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  // -------------------- HANDLE REGISTER --------------------
  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCDf0L31c7ZYq2HolzIxfKIsC9BIEUHgBo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let message = 'Đăng ký thất bại';
        switch (data.error?.message) {
          case 'EMAIL_EXISTS':
            message = 'Email đã tồn tại';
            break;
          case 'OPERATION_NOT_ALLOWED':
            message = 'Tài khoản chưa được phép đăng ký';
            break;
          case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            message = 'Quá nhiều yêu cầu, thử lại sau';
            break;
        }
        throw new Error(message);
      }

      // 🔥 CREATE USER IN FIRESTORE
      await createUserFirestore(
        data.localId, // UID
        data.email,
        name
      );

      Alert.alert('Thành công', `Đăng ký thành công! Chào mừng ${name}`);
      router.replace('/(auth)/login');

    } catch (error: any) {
      Alert.alert('Lỗi đăng ký', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // ĐÃ SỬA: Thêm styles.container vào đây để lấy nền đen
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          {/* HEADER */}
          <View style={styles.header}>
            <Ionicons name="person-add-outline" size={48} color="#7C3AED" />
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>
              Nhập thông tin để đăng ký tài khoản
            </Text>
          </View>

          {/* NAME */}
          <View>
            <View style={styles.inputGroup}>
              <Ionicons name="person-outline" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors({ ...errors, name: undefined });
                }}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* EMAIL */}
          <View>
            <View style={styles.inputGroup}>
              <Ionicons name="mail-outline" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors({ ...errors, email: undefined });
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* PASSWORD */}
          <View>
            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} style={styles.icon} />
              <TextInput
                // ĐÃ SỬA: Áp dụng styles.input
                style={styles.input}
                placeholder="Mật khẩu"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#7C3AED"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* CONFIRM PASSWORD */}
          <View>
            <View style={styles.inputGroup}>
              <Ionicons name="lock-closed-outline" size={20} style={styles.icon} />
              <TextInput
                // ĐÃ SỬA: Áp dụng styles.input
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors({ ...errors, confirmPassword: undefined });
                }}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#7C3AED"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* BUTTON */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Đăng ký</Text>
          </TouchableOpacity>

          {/* LOGIN */}
          <View style={styles.bottomLinks}>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  // 1. CONTAINER CHUNG
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  // 2. SCROLLVIEW CONTAINER (CĂN GIỮA DỌC VÀ NGANG)
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // 3. KHUNG FORM BÊN TRONG (INNER)
  inner: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 30,

    // Shadow rất nhẹ
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 40,
    elevation: 1,
  },


  // --- Các style thành phần ---
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    color: '#1F2937', // Màu chữ đen đậm (Gray 900)
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 6,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputGroup: {

    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  icon: {
    marginRight: 12,
    color: '#6366F1',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 32,
    alignItems: 'center',

    // Shadow
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  bottomLinks: {
    marginTop: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // Đường phân cách xám rất nhạt
    paddingTop: 32,
  },
  link: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  errorText: {
    color: '#F87171',
    marginBottom: 12,
    marginLeft: 8,
    fontSize: 13,
  },
});
