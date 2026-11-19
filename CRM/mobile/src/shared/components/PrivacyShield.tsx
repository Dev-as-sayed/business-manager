import { useEffect, useState, type ReactNode } from 'react';
import { AppState, Text, View } from 'react-native';

export const PrivacyShield = ({ children }: { children: ReactNode }) => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setHidden(state !== 'active');
    });

    return () => subscription.remove();
  }, []);

  return (
    <View className="flex-1">
      {children}
      {hidden ? (
        <View className="absolute inset-0 items-center justify-center gap-2 bg-ink-900">
          <Text className="text-[22px] font-bold text-white">Manifest CRM</Text>
          <Text className="text-[12px] text-white/50">Your workspace is protected</Text>
        </View>
      ) : null}
    </View>
  );
};
