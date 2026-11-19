import { Text, View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/shared/hooks/useNetworkStatus';

export const OfflineBanner = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();

  if (isConnected && isInternetReachable) {
    return null;
  }

  return (
    <View className="mb-3 flex-row items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5">
      <WifiOff size={16} color="#B45309" />
      <Text className="flex-1 text-[12px] font-medium text-amber-800">
        You are offline. Showing saved data until the connection returns.
      </Text>
    </View>
  );
};
