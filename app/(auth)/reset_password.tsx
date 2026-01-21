import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
  const { oobCode } = useLocalSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    setError('');

    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!oobCode) {
      setError('Link đặt lại mật khẩu không hợp lệ');
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode as string, password);
      setIsSuccess(true);
    } catch (err) {
      setError('Link đã hết hạn hoặc không hợp lệ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  // ====== SUCCESS UI ======
  if (isSuccess) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <View style={styles.iconContainerSuccess}>
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
          </View>

          <Text style={styles.title}>Đổi mật khẩu thành công</Text>
          <Text style={styles.message}>
            Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ
          </Text>

          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Quay lại đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ====== FORM UI ======
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={48} color="#4F46E5" />
        </View>

        <Text style={styles.title}>Đặt lại mật khẩu</Text>
        <Text style={styles.message}>
          Nhập mật khẩu mới cho tài khoản của bạn
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Mật khẩu mới"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
            style={[styles.input, error && styles.errorInput]}
          />
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Xác nhận mật khẩu"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError('');
            }}
            style={[styles.input, error && styles.errorInput]}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleResetPassword}
          style={[styles.button, isLoading && styles.buttonDisabled]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác nhận</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBackToLogin}
          style={styles.backButtonBottom}
        >
          <Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainerSuccess: {
    width: 64,
    height: 64,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1F2937',
  },
  message: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 20,
    fontSize: 16,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    height: 48,
  },
  errorInput: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  backButtonBottom: {
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});
