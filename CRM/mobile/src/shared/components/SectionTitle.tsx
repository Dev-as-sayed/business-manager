import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export const SectionTitle = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <View className="flex-row items-end justify-between gap-3">
    <View className="flex-1 gap-0.5">
      <Text className="text-[17px] font-bold tracking-tight text-ink-900">{title}</Text>
      {subtitle ? <Text className="text-[12px] text-ink-500">{subtitle}</Text> : null}
    </View>
    {action}
  </View>
);
