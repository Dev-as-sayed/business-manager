import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { AlertCircle, Inbox } from 'lucide-react-native';
import { Button } from '@/shared/components/Button';

export const EmptyState = ({
  title,
  message,
  icon,
  action,
}: {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) => (
  <View className="items-center justify-center gap-3 rounded-card border border-dashed border-ink-200 bg-surface/60 px-6 py-10">
    <View className="h-12 w-12 items-center justify-center rounded-full bg-ink-50">
      {icon ?? <Inbox size={24} color="#526C60" />}
    </View>
    <Text className="text-center text-[16px] font-semibold text-ink-900">{title}</Text>
    {message ? (
      <Text className="text-center text-[13px] leading-5 text-ink-500">{message}</Text>
    ) : null}
    {action}
  </View>
);

export const ErrorState = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <View className="items-center justify-center gap-3 rounded-card border border-coral-100 bg-coral-50/50 px-6 py-8">
    <AlertCircle size={28} color="#E11D48" />
    <Text className="text-center text-[13px] leading-5 text-coral-800">{message}</Text>
    {onRetry ? <Button title="Try again" variant="secondary" compact onPress={onRetry} /> : null}
  </View>
);

export const LoadingState = ({ label = 'Loading' }: { label?: string }) => (
  <View className="items-center justify-center gap-3 py-10">
    <ActivityIndicator color="#047857" />
    <Text className="text-[13px] text-ink-500">{label}</Text>
  </View>
);

export const Skeleton = ({ className }: { className?: string }) => (
  <View className={`animate-pulse rounded-xl bg-ink-100/80 ${className ?? 'h-4 w-full'}`} />
);

export const ListRow = ({
  title,
  subtitle,
  right,
  onPress,
  left,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  left?: ReactNode;
}) => {
  const content = (
    <View className="flex-row items-center gap-3 rounded-2xl border border-ink-100/70 bg-surface p-4">
      {left}
      <View className="flex-1 gap-1">
        <Text className="text-[15px] font-semibold text-ink-900" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-[12px] leading-4 text-ink-500" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-70">
      {content}
    </Pressable>
  );
};
