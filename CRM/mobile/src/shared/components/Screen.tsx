import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { cn } from '@/shared/utils/cn';
import { OfflineBanner } from '@/shared/components/OfflineBanner';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
  contentClassName?: string;
  footer?: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const Screen = ({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  className,
  contentClassName,
  footer,
  edges = ['top'],
}: ScreenProps) => {
  const body = scroll ? (
    <ScrollView
      className={cn('flex-1 bg-canvas', className)}
      contentContainerStyle={{ padding: 20, paddingBottom: footer ? 120 : 32 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#047857"
            colors={['#047857']}
          />
        ) : undefined
      }
    >
      <OfflineBanner />
      <View className={cn('gap-4', contentClassName)}>{children}</View>
    </ScrollView>
  ) : (
    <View className={cn('flex-1 bg-canvas', className)}>
      <OfflineBanner />
      <View className={cn('flex-1 gap-4 p-5', contentClassName)}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={edges}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
        {footer ? (
          <View className="absolute bottom-0 left-0 right-0 border-t border-ink-100 bg-canvas p-4">
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Go back"
    hitSlop={10}
    onPress={onPress}
    className="mt-1 h-10 w-10 items-center justify-center rounded-full border border-ink-100 bg-surface active:opacity-70"
  >
    <ArrowLeft size={20} color="#14211C" />
  </Pressable>
);

export const PageHeader = ({
  title,
  subtitle,
  back,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  back?: () => void;
  right?: ReactNode;
  className?: string;
}) => (
  <View className={cn('flex-row items-start justify-between gap-3', className)}>
    <View className="flex-1 flex-row items-start gap-2">
      {back ? <BackButton onPress={back} /> : null}
      <View className="flex-1 gap-1">
        <Text className="text-[28px] font-bold tracking-tight text-ink-900">{title}</Text>
        {subtitle ? <Text className="text-[14px] leading-5 text-ink-500">{subtitle}</Text> : null}
      </View>
    </View>
    {right}
  </View>
);
