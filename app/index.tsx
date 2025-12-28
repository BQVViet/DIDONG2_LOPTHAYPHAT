import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  Image, 
  SafeAreaView, 
  StyleSheet,
  Animated,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from "expo-router";

const { width } = Dimensions.get('window');

// --- CẤU HÌNH DỮ LIỆU SLIDES (Giữ nguyên) ---
const slides = [
  {
    id: 1,
    title: 'Chào mừng đến với MyApp',
    subtitle: 'Trải nghiệm mua sắm tuyệt vời',
    description: 'Khám phá hàng ngàn sản phẩm chính hãng với giá tốt nhất thị trường',
    image: 'https://images.unsplash.com/photo-1751759192037-a51efd95a480?q=80&w=1080',
    icon: 'sparkles',
    lib: 'Ionicons',
    primaryColor: '#4F46E5',
    secondaryColor: '#EEF2FF',
  },
  {
    id: 2,
    title: 'Mua sắm thông minh',
    subtitle: 'Tiện lợi - Nhanh chóng',
    description: 'Tìm kiếm và đặt hàng dễ dàng chỉ với vài thao tác đơn giản',
    image: 'https://images.unsplash.com/photo-1758598306362-9d2a212d92a1?q=80&w=1080',
    icon: 'shopping-bag',
    lib: 'FontAwesome5',
    primaryColor: '#D946EF',
    secondaryColor: '#FDF4FF',
  },
  {
    id: 3,
    title: 'Giao hàng siêu tốc',
    subtitle: 'Nhanh chóng & An toàn',
    description: 'Giao hàng tận nơi trong 24h, miễn phí ship cho đơn từ 200k',
    image: 'https://images.unsplash.com/photo-1758523670564-d1d6a734dc0b?q=80&w=1080',
    icon: 'truck-fast',
    lib: 'MaterialCommunityIcons',
    primaryColor: '#F97316',
    secondaryColor: '#FFF7ED',
  },
];

export default function CombinedAppScreen() {
  const [appState, setAppState] = useState<'splash' | 'welcome'>('splash');

  useEffect(() => {
    // Tự động chuyển trang sau 2.5 giây (rút ngắn lại cho mượt hơn)
    const timer = setTimeout(() => {
      setAppState('welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleFinishWelcome = () => {
    router.replace("/(auth)/login");
  };

  if (appState === 'splash') {
    return <SplashScreen />;
  }

  return <WelcomeScreen onGetStarted={handleFinishWelcome} />;
}

// ================= COMPONENT 1: SPLASH SCREEN (ĐÃ SỬA) =================
function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current; // Bắt đầu từ nhỏ hơn để tạo hiệu ứng bung

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#4F9DF9" />
      <Animated.View style={{ 
        opacity: fadeAnim, 
        transform: [{ scale: scaleAnim }], 
        alignItems: 'center' 
      }}>
        <View style={styles.splashLogoWrapper}>
          <Image 
            source={require("@/assets/images/partial-react-logo.png")} 
            style={styles.splashLogo}
            resizeMode="contain" 
          />
        </View>
        {/* Đã bỏ toàn bộ Text tại đây */}
      </Animated.View>
    </View>
  );
}

// ================= COMPONENT 2: WELCOME SCREEN (Giữ nguyên logic) =================
function WelcomeScreen({ onGetStarted }: { onGetStarted: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const data = slides[currentSlide];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideUp.setValue(30);
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, friction: 8, useNativeDriver: true })
    ]).start();
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onGetStarted();
    }
  };

  const renderIcon = () => {
    const props = { name: data.icon as any, size: 45, color: data.primaryColor };
    if (data.lib === 'Ionicons') return <Ionicons {...props} />;
    if (data.lib === 'FontAwesome5') return <FontAwesome5 {...props} size={38} />;
    if (data.lib === 'MaterialCommunityIcons') return <MaterialCommunityIcons {...props} />;
    return null;
  };

  return (
    <SafeAreaView style={styles.welcomeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.welcomeHeader}>
        <TouchableOpacity onPress={onGetStarted}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.welcomeContent, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}>
        <View style={[styles.iconCircle, { backgroundColor: data.secondaryColor }]}>
          {renderIcon()}
        </View>

        <View style={[styles.imageWrapper, { borderColor: data.secondaryColor }]}>
          <Image source={{ uri: data.image }} style={styles.slideImage} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.welcomeTitle}>{data.title}</Text>
          <View style={[styles.subtitleBadge, { backgroundColor: data.secondaryColor }]}>
            <Text style={[styles.subtitleText, { color: data.primaryColor }]}>{data.subtitle}</Text>
          </View>
          <Text style={styles.descriptionText}>{data.description}</Text>
        </View>
      </Animated.View>

      <View style={styles.welcomeFooter}>
        <View style={styles.indicatorRow}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, { 
              width: i === currentSlide ? 25 : 8, 
              backgroundColor: i === currentSlide ? data.primaryColor : '#E2E8F0' 
            }]} />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.nextBtn, { backgroundColor: data.primaryColor }]} 
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {currentSlide === slides.length - 1 ? 'Khám phá ngay' : 'Tiếp tục'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // SPLASH STYLES
  splashContainer: {
    flex: 1,
    backgroundColor: "#4F9DF9",
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogoWrapper: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 50,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  splashLogo: {
    width: 140,
    height: 140,
  },

  // WELCOME STYLES (Giữ nguyên)
  welcomeContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  welcomeHeader: { paddingHorizontal: 25, paddingVertical: 15, alignItems: 'flex-end' },
  skipText: { fontSize: 15, color: '#94A3B8', fontWeight: '600' },
  welcomeContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  imageWrapper: { width: width * 0.65, height: width * 0.65, borderRadius: 40, borderWidth: 8, overflow: 'hidden', marginBottom: 25 },
  slideImage: { width: '100%', height: '100%' },
  textContainer: { alignItems: 'center' },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 10 },
  subtitleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginBottom: 12 },
  subtitleText: { fontSize: 14, fontWeight: '700' },
  descriptionText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  welcomeFooter: { paddingHorizontal: 30, paddingBottom: 40 },
  indicatorRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 25 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: { flexDirection: 'row', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 12, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  nextBtnText: { color: 'white', fontSize: 17, fontWeight: 'bold' },
});