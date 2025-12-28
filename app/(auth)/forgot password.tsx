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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 👈 ĐÃ THÊM: Import useRouter

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); // 👈 ĐÃ THÊM: Khởi tạo router

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async () => {
        setError('');
        if (!email) {
            setError('Vui lòng nhập địa chỉ email');
            return;
        }
        if (!validateEmail(email)) {
            setError('Địa chỉ email không hợp lệ');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyCDf0L31c7ZYq2HolzIxfKIsC9BIEUHgBo`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
                }
            );
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || 'Gửi email thất bại');
            }
            setIsSubmitted(true);
        } catch (err: any) {
            setError('Gửi email thất bại: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };


    // 👈 ĐÃ SỬA: handleBack giờ chỉ điều hướng về Login
    const handleBackToLogin = () => {
        // Sử dụng replace để thay thế màn hình hiện tại bằng Login
        router.replace('/(auth)/login');
    };

    if (isSubmitted) {
        return (
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.card}>
                    <View style={styles.iconContainerSuccess}>
                        <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
                    </View>
                    <Text style={styles.title}>Kiểm tra email của bạn</Text>
                    <Text style={styles.message}>
                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email:
                    </Text>
                    <Text style={styles.emailText}>{email}</Text>
                    <Text style={styles.note}>
                        Nếu bạn không nhận được email trong vài phút, vui lòng kiểm tra thư mục spam hoặc thử lại.
                    </Text>

                    {/* ĐÃ SỬA: Nút Quay lại Đăng nhập ở trạng thái Success */}
                    <TouchableOpacity onPress={handleBackToLogin} style={styles.backButtonBottom}>
                        <Text style={[styles.backButtonText, { color: '#4F46E5' }]}>
                            Quay lại đăng nhập
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <Ionicons name="mail" size={48} color="#4F46E5" />
                </View>
                <Text style={styles.title}>Quên mật khẩu?</Text>
                <Text style={styles.message}>
                    Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
                </Text>

                <View style={styles.inputWrapper}>
                    <TextInput
                        placeholder="nhapemail@example.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setError('');
                        }}
                        style={[styles.input, error && styles.errorInput]}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {error ? (
                        <Ionicons
                            name="alert-circle"
                            size={20}
                            color="#EF4444"
                            style={styles.errorIcon}
                        />
                    ) : null}
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Gửi hướng dẫn đặt lại</Text>
                    )}
                </TouchableOpacity>

                {/* ĐÃ SỬA: Nút Quay lại Đăng nhập ở trạng thái Form */}
                <TouchableOpacity
                    onPress={handleBackToLogin}
                    style={styles.backButtonBottom}
                >
                    <Text style={[styles.backButtonText, { color: '#6B7280' }]}>
                        Quay lại đăng nhập
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

// ... Giữ nguyên phần styles
const styles = StyleSheet.create({
    // 1. CONTAINER CHUNG
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // 2. CARD CHÍNH (Modal/Form Wrapper)
    card: {
        width: '100%',
        paddingHorizontal: 24,
        padding: 24,
        alignItems: 'center',
    },

    // 3. ICON CONTAINER
    iconContainer: {
        width: 64,
        height: 64,
        //     borderRadius: 32,
        backgroundColor: '#E0E7FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    iconContainerSuccess: {
        width: 64,
        height: 64,
        //     borderRadius: 32,
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },

    // 4. TEXT
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
        marginBottom: 16,
        fontSize: 16,
    },
    note: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 13,
        marginBottom: 24,
    },
    emailText: {
        fontWeight: '700',
        marginBottom: 12,
        color: '#1F2937',
        fontSize: 16,
    },

    // 5. INPUT
    inputWrapper: {
        width: '100%',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        color: '#1F2937',
        height: 48,
    },
    errorInput: {
        borderColor: '#EF4444',
    },
    errorIcon: {
        position: 'absolute',
        right: 12,
        top: 12,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        marginTop: 6,
        marginLeft: 4,
    },

    // 6. BUTTONS

    button: {
        width: '100%',
        backgroundColor: '#4F46E5', // Màu Xanh Tím chính


        alignItems: 'center',
        marginTop: 16, // Khoảng cách trên nút

        // Shadow cho nút
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#A5B4FC', // Màu Xanh Tím nhạt hơn khi vô hiệu hóa
    },
    buttonText: {
        color: '#FFFFFF', // Chữ trắng
        fontWeight: '700', // Tăng độ đậm
        fontSize: 17, // Tăng nhẹ font size
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    backButtonBottom: {
        marginTop: 16,
        alignSelf: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 6,
        color: '#6B7280',
    },
});