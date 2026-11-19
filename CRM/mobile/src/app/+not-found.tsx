import { router } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/shared/components/Button';

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-ink-50">
          <SearchX size={30} color="#526C60" />
        </View>
        <Text className="text-center text-[22px] font-bold text-ink-900">Page not found</Text>
        <Text className="text-center text-[13px] leading-5 text-ink-500">
          The screen you followed does not exist or is no longer available.
        </Text>
        <Button title="Go home" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}
