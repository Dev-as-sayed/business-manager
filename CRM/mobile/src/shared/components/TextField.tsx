import type { ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { cn } from '@/shared/utils/cn';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  right?: ReactNode;
  containerClassName?: string;
}

export const TextField = ({
  label,
  error,
  hint,
  right,
  containerClassName,
  className,
  multiline,
  ...rest
}: TextFieldProps) => (
  <View className={cn('gap-1.5', containerClassName)}>
    {label ? <Text className="text-[13px] font-semibold text-ink-700">{label}</Text> : null}
    <View
      className={cn(
        'min-h-12 flex-row items-center rounded-xl border bg-surface px-3.5',
        error ? 'border-coral-400' : 'border-ink-100',
      )}
    >
      <TextInput
        className={cn(
          'flex-1 py-3 text-[15px] text-ink-900',
          multiline && 'min-h-24 text-top',
          className,
        )}
        placeholderTextColor="#9CB0A6"
        multiline={multiline}
        {...rest}
      />
      {right}
    </View>
    {error ? <Text className="text-[12px] font-medium text-coral-600">{error}</Text> : null}
    {!error && hint ? <Text className="text-[12px] text-ink-400">{hint}</Text> : null}
  </View>
);
