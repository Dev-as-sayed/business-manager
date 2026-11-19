import '../global.css';
import '@/shared/i18n';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Toaster } from 'sonner-native';
import { persistor, store } from '@/store/store';
import { useAppBootstrap } from '@/features/auth/useAppBootstrap';
import { selectAuthStatus } from '@/features/auth/auth.slice';
import { useAppSelector } from '@/store/hooks';
import { initSentry, Sentry } from '@/shared/monitoring/sentry';
import { PrivacyShield } from '@/shared/components/PrivacyShield';
import { BiometricGate } from '@/shared/components/BiometricGate';
import { Button } from '@/shared/components/Button';

initSentry();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Text className="text-center text-[22px] font-bold text-ink-900">Something went wrong</Text>
        <Text className="text-center text-[13px] leading-5 text-ink-500">
          The app hit an unexpected error. Your data is safe.
        </Text>
        <Button title="Try again" onPress={() => void retry()} />
      </View>
    </SafeAreaView>
  );
}

const Splash = () => (
  <View className="flex-1 items-center justify-center gap-5 bg-ink-900">
    <View className="h-16 w-16 items-center justify-center rounded-2xl bg-jade-500">
      <Text className="text-[26px] font-black text-ink-900">M</Text>
    </View>
    <View className="items-center gap-1">
      <Text className="text-[24px] font-bold tracking-tight text-white">Manifest CRM</Text>
      <Text className="text-[13px] text-white/60">Your export operations, in one place</Text>
    </View>
    <ActivityIndicator color="#34D399" />
  </View>
);

const BootstrapGate = ({ children }: { children: ReactNode }) => {
  const status = useAppSelector(selectAuthStatus);

  useAppBootstrap();

  if (status === 'idle' || status === 'loading') {
    return <Splash />;
  }

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<Splash />}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <BottomSheetModalProvider>
              <StatusBar style="dark" />
              <PrivacyShield>
                <BootstrapGate>
                  <BiometricGate>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#F4F6F2' },
                        animation: 'slide_from_right',
                      }}
                    />
                  </BiometricGate>
                </BootstrapGate>
              </PrivacyShield>
              <Toaster position="top-center" />
            </BottomSheetModalProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}
