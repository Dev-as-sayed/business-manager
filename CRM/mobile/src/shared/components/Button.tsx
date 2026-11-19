import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/shared/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const container: Record<Variant, string> = {
  primary: 'bg-jade-600 border border-jade-600',
  secondary: 'bg-surface border border-ink-100',
  ghost: 'bg-transparent border border-transparent',
  danger: 'bg-coral-600 border border-coral-600',
};

const label: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-ink-900',
  ghost: 'text-jade-700',
  danger: 'text-white',
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
  compact?: boolean;
}

export const Button = ({
  title,
  variant = 'primary',
  loading = false,
  icon,
  className,
  compact = false,
  disabled,
  onPress,
  ...rest
}: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={title}
    disabled={disabled || loading}
    className={cn(
      'flex-row items-center justify-center gap-2 rounded-xl',
      compact ? 'px-3 py-2' : 'px-4 py-3.5',
      container[variant],
      (disabled || loading) && 'opacity-50',
      className,
    )}
    style={({ pressed }) => (pressed ? { opacity: 0.78 } : undefined)}
    onPress={(event) => {
      void Haptics.selectionAsync();
      onPress?.(event);
    }}
    {...rest}
  >
    {loading ? (
      <ActivityIndicator
        color={variant === 'secondary' || variant === 'ghost' ? '#047857' : '#fff'}
      />
    ) : (
      icon
    )}
    <Text className={cn('text-[15px] font-semibold', label[variant])}>{title}</Text>
  </Pressable>
);
