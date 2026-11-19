import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Card } from '@/shared/components/Card';
import { cn } from '@/shared/utils/cn';

export const DetailSection = ({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <Card className={cn('gap-3', className)}>
    {title ? (
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[15px] font-bold text-ink-900">{title}</Text>
        {action}
      </View>
    ) : null}
    {children}
  </Card>
);

export const DetailRow = ({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) => (
  <View className={cn('flex-row items-start justify-between gap-4', className)}>
    <Text className="flex-1 text-[13px] text-ink-500">{label}</Text>
    {typeof value === 'string' || typeof value === 'number' ? (
      <Text className="max-w-[62%] text-right text-[13px] font-semibold text-ink-800">{value}</Text>
    ) : (
      value
    )}
  </View>
);
