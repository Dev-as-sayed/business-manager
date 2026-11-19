import { Text, View } from 'react-native';
import { cn } from '@/shared/utils/cn';
import { getStatusTone, type StatusTone } from '@/shared/utils/status';
import { titleCase } from '@/shared/utils/format';

const toneContainer: Record<StatusTone, string> = {
  neutral: 'bg-ink-50 border-ink-100',
  info: 'bg-sky-50 border-sky-200',
  success: 'bg-jade-50 border-jade-200',
  warning: 'bg-amber-50 border-amber-200',
  danger: 'bg-coral-50 border-coral-200',
};

const toneText: Record<StatusTone, string> = {
  neutral: 'text-ink-600',
  info: 'text-sky-700',
  success: 'text-jade-700',
  warning: 'text-amber-700',
  danger: 'text-coral-700',
};

const toneDot: Record<StatusTone, string> = {
  neutral: 'bg-ink-300',
  info: 'bg-sky-500',
  success: 'bg-jade-500',
  warning: 'bg-amber-500',
  danger: 'bg-coral-500',
};

export const StatusBadge = ({ status, className }: { status: string; className?: string }) => {
  const tone = getStatusTone(status);

  return (
    <View
      className={cn(
        'flex-row items-center gap-1.5 self-start rounded-full border px-2.5 py-1',
        toneContainer[tone],
        className,
      )}
    >
      <View className={cn('h-1.5 w-1.5 rounded-full', toneDot[tone])} />
      <Text className={cn('text-[11px] font-semibold uppercase tracking-wide', toneText[tone])}>
        {titleCase(status)}
      </Text>
    </View>
  );
};
