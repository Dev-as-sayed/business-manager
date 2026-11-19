import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { AlertTriangle, BellRing, CheckCircle2, Info, XCircle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import {
  useNotificationFeed,
  type NotificationTone,
} from '@/features/notifications/useNotificationFeed';
import { markAllRead } from '@/features/notifications/notifications.slice';
import { useAppDispatch } from '@/store/hooks';
import { Button } from '@/shared/components/Button';
import { EmptyState, LoadingState } from '@/shared/components/StateViews';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { cn } from '@/shared/utils/cn';

const toneStyles: Record<NotificationTone, { bg: string; icon: typeof Info; color: string }> = {
  info: { bg: 'bg-sky-50', icon: Info, color: '#0369A1' },
  success: { bg: 'bg-jade-50', icon: CheckCircle2, color: '#047857' },
  warning: { bg: 'bg-amber-50', icon: AlertTriangle, color: '#B45309' },
  danger: { bg: 'bg-coral-50', icon: XCircle, color: '#E11D48' },
};

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const { items, unreadCount, isLoading } = useNotificationFeed();
  const [refreshing, setRefreshing] = useState(false);

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
      }}
    >
      <PageHeader
        title="Notifications"
        subtitle="Approvals, quality checks, and shipment updates that need attention."
        right={
          unreadCount > 0 ? (
            <Button
              title="Mark read"
              variant="secondary"
              compact
              onPress={() => dispatch(markAllRead())}
            />
          ) : undefined
        }
      />

      {isLoading ? <LoadingState label="Loading alerts" /> : null}

      {!isLoading && items.length === 0 ? (
        <EmptyState
          icon={<BellRing size={24} color="#526C60" />}
          title="You are all caught up"
          message="New approvals, QC results, and shipment updates will appear here."
        />
      ) : null}

      {!isLoading ? (
        <View className="gap-2.5">
          {items.map((item) => {
            const tone = toneStyles[item.tone];
            const Icon = tone.icon;

            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(item.href as Href)}
                className={cn(
                  'flex-row items-start gap-3 rounded-2xl border p-4 active:opacity-70',
                  item.read ? 'border-ink-100 bg-surface' : 'border-jade-200 bg-jade-50/40',
                )}
              >
                <View className={cn('h-10 w-10 items-center justify-center rounded-xl', tone.bg)}>
                  <Icon size={19} color={tone.color} />
                </View>
                <View className="flex-1 gap-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <Text className="flex-1 text-[14px] font-semibold text-ink-900">
                      {item.title}
                    </Text>
                    {!item.read ? <View className="mt-1 h-2 w-2 rounded-full bg-jade-500" /> : null}
                  </View>
                  <Text className="text-[12px] leading-5 text-ink-500">{item.message}</Text>
                  <Text className="text-[11px] text-ink-400">{item.displayDate}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}
