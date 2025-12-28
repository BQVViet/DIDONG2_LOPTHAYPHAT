import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/Register" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/forgot password" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="PaymentMethodsScreen" options={{ headerShown: false }} />
        <Stack.Screen name="OrderHistoryScreen" options={{ headerShown: false }} />
        <Stack.Screen name="AddressManagementScreen" options={{ headerShown: false }} />
        <Stack.Screen name="CheckoutScreen" options={{ headerShown: false }} />
        <Stack.Screen name="NotificationScreen" options={{ headerShown: false }} />
        <Stack.Screen name="Setting" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
