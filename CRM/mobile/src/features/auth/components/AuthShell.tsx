import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '@/shared/components/Screen';

export const AuthShell = ({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) => (
  <Screen contentClassName="gap-7 pt-8" edges={['top', 'bottom']}>
    <View className="gap-5">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-ink-900">
        <View className="h-7 w-7 items-center justify-center rounded-lg bg-jade-400">
          <Text className="text-[16px] font-black text-ink-900">M</Text>
        </View>
      </View>
      <View className="gap-2">
        {eyebrow ? (
          <Text className="text-[11px] font-bold uppercase tracking-[2px] text-jade-700">
            {eyebrow}
          </Text>
        ) : null}
        <Text className="text-[32px] font-bold leading-[38px] tracking-tight text-ink-900">
          {title}
        </Text>
        <Text className="text-[14px] leading-6 text-ink-500">{subtitle}</Text>
      </View>
    </View>

    {children}

    {footer ? <View className="mt-2">{footer}</View> : null}
  </Screen>
);
