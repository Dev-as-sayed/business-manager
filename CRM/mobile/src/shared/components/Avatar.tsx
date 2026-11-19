import { Text, View } from 'react-native';
import { cn } from '@/shared/utils/cn';
import { initials } from '@/shared/utils/format';

export const Avatar = ({
  firstName,
  lastName,
  size = 'md',
  className,
}: {
  firstName?: string | null;
  lastName?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  } as const;

  const textSizes = {
    sm: 'text-[11px]',
    md: 'text-[13px]',
    lg: 'text-[18px]',
  } as const;

  return (
    <View
      className={cn(
        'items-center justify-center rounded-full border border-jade-100 bg-jade-50',
        sizes[size],
        className,
      )}
    >
      <Text className={cn('font-bold text-jade-700', textSizes[size])}>
        {initials(firstName, lastName)}
      </Text>
    </View>
  );
};
