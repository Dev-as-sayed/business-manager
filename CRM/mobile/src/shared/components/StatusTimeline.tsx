import { Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { cn } from '@/shared/utils/cn';
import { formatDate } from '@/shared/utils/format';

export interface TimelineStep {
  status: string;
  label: string;
  date?: string | null;
}

export const StatusTimeline = ({
  steps,
  currentStatus,
}: {
  steps: TimelineStep[];
  currentStatus: string;
}) => {
  const currentIndex = steps.findIndex((step) => step.status === currentStatus);
  const cancelled = currentStatus === 'CANCELLED';

  return (
    <View className="gap-0">
      {steps.map((step, index) => {
        const complete = !cancelled && index < currentIndex;
        const active = !cancelled && index === currentIndex;
        const last = index === steps.length - 1;

        return (
          <View key={step.status} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={cn(
                  'h-6 w-6 items-center justify-center rounded-full border',
                  complete
                    ? 'border-jade-600 bg-jade-600'
                    : active
                      ? 'border-jade-500 bg-jade-50'
                      : 'border-ink-200 bg-surface',
                )}
              >
                {complete ? (
                  <Check size={13} color="#FFFFFF" />
                ) : (
                  <View
                    className={cn('h-2 w-2 rounded-full', active ? 'bg-jade-500' : 'bg-ink-200')}
                  />
                )}
              </View>
              {!last ? (
                <View
                  className={cn('w-0.5 flex-1', complete ? 'bg-jade-300' : 'bg-ink-100')}
                  style={{ minHeight: 26 }}
                />
              ) : null}
            </View>
            <View className="flex-1 pb-4">
              <Text
                className={cn(
                  'text-[13px] font-semibold',
                  complete || active ? 'text-ink-900' : 'text-ink-400',
                )}
              >
                {step.label}
              </Text>
              <Text className="text-[11px] text-ink-400">
                {step.date ? formatDate(step.date) : active ? 'Current stage' : 'Pending'}
              </Text>
            </View>
          </View>
        );
      })}
      {cancelled ? (
        <View className="rounded-xl border border-coral-200 bg-coral-50 px-3 py-2.5">
          <Text className="text-[12px] font-semibold text-coral-700">
            This purchase order was cancelled.
          </Text>
        </View>
      ) : null}
    </View>
  );
};
