import { useEffect } from 'react';
import type { ErrorBoundaryProps } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sentry } from '@/shared/monitoring/sentry';
import { Button } from '@/shared/components/Button';

export const RouteErrorBoundary = ({ error, retry }: ErrorBoundaryProps) => {
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
};
