import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TABS, getTabsForRole } from '@/config/routes.config';
import { selectAuthUser } from '@/features/auth/auth.slice';
import { useAppSelector } from '@/store/hooks';
import { useNotificationFeed } from '@/features/notifications/useNotificationFeed';

export default function TabsLayout() {
  const { t } = useTranslation();
  const user = useAppSelector(selectAuthUser);
  const insets = useSafeAreaInsets();
  const visible = new Set(getTabsForRole(user?.role).map((tab) => tab.name));
  const { unreadCount } = useNotificationFeed();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#047857',
        tabBarInactiveTintColor: '#9CB0A6',
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 4,
          borderTopColor: '#DDE4E0',
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(`tabs.${tab.name}`),
            href: visible.has(tab.name) ? undefined : null,
            tabBarIcon: ({ color, size }) => <tab.icon size={size} color={color} />,
            tabBarBadge: tab.name === 'notifications' && unreadCount > 0 ? unreadCount : undefined,
            tabBarBadgeStyle: { backgroundColor: '#E11D48', fontSize: 9, fontWeight: '700' },
          }}
        />
      ))}
    </Tabs>
  );
}
