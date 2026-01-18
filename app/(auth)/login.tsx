import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons'; // Nếu dùng Expo
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../app/firebase/firebaseConfig";


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState(''); // ✨ lỗi hiển thị
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    setLoginError('');

    try {
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCDf0L31c7ZYq2HolzIxfKIsC9BIEUHgBo`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let message = 'Đăng nhập thất bại: Email hoặc mật khẩu không đúng';
        switch (data.error?.message) {
          case 'EMAIL_NOT_FOUND':
            message = 'Email không tồn tại';
            break;
          case 'INVALID_PASSWORD':
            message = 'Mật khẩu không đúng';
            break;
          case 'USER_DISABLED':
            message = 'Tài khoản đã bị khóa';
            break;
          case 'INVALID_EMAIL':
            message = 'Email không hợp lệ';
            break;
        }
        setLoginError(message);
        return;
      }



      console.log('Đăng nhập thành công:', data);
      // ✅ LƯU idToken
      await AsyncStorage.setItem('idToken', data.idToken);

      // (tuỳ chọn) lưu email nếu muốn
      await AsyncStorage.setItem('userEmail', data.email);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.innerContainer}>
          {/* TITLE */}
          <View style={styles.iconWrapper}>
            <Ionicons name="log-in-outline" size={32} color="white" />
          </View>
          <ThemedText
            type="title"
            style={{
              fontFamily: Fonts.rounded,
              textAlign: 'center',
              fontSize: 22,
              color: '#0f172a',
              marginBottom: 4,
            }}
          >
            Chào mừng trở lại
          </ThemedText>
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 24 }}>
            Đăng nhập để tiếp tục
          </Text>

          {/* FORM LOGIN */}
          <View style={styles.form}>
            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
              <TextInput
                placeholder="email@example.com"
                placeholderTextColor="#475569"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>

            {/* Password */}
            <Text style={[styles.label, { marginTop: 20 }]}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#475569"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Checkbox + Forgot Password */}
            <View style={styles.rowBetween}>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
                <Text style={styles.checkboxLabel}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/forgot password')}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* Button Login */}
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
            </TouchableOpacity>

            {/* Hiển thị lỗi */}
            {loginError ? (
              <Text style={{ color: '#F87171', textAlign: 'center', marginTop: 12 }}>{loginError}</Text>
            ) : null}

            {/* Or separator */}
            <Text style={styles.orText}>Hoặc đăng nhập với</Text>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <AntDesign name="google" size={20} color="#DB4437" />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <AntDesign name="github" size={20} color="#000" />
                <Text style={styles.socialText}>GitHub</Text>
              </TouchableOpacity>
            </View>

            {/* Register */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/Register')}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F7F8FA',
  },
  iconWrapper: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    alignSelf: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    color: '#4B5563',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    height: 50,
    marginBottom: 16,
  },
  input: {
    color: '#1F2937',
    fontSize: 16,
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  checkboxLabel: {
    color: '#374151',
    marginLeft: 8,
    fontSize: 14,
  },
  forgotText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  orText: {
    marginTop: 30,
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  socialButton: {
    flexDirection: 'row', // Đưa icon và chữ nằm ngang
    alignItems: 'center', // Căn giữa theo chiều dọc
    justifyContent: 'center', // Căn giữa theo chiều ngang
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '48%', // Chia đôi chiều rộng hàng
  },
  socialText: {
    marginLeft: 10, // Khoảng cách giữa Icon và Chữ
    fontSize: 16,
    fontWeight: '500',
  },
  registerContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  registerLink: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
