import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Linking, Pressable, Switch, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  Bell,
  ChevronRight,
  FileUp,
  Fingerprint,
  KeyRound,
  LogOut,
  Shield,
} from 'lucide-react-native';
import { toast } from 'sonner-native';
import { useLogoutMutation } from '@/features/auth/auth.api';
import { usePermission } from '@/shared/hooks/usePermission';
import { isBiometricLockEnabled, setBiometricLockEnabled } from '@/shared/components/BiometricGate';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  resetUploadQueue,
  selectActiveUploadCount,
} from '@/features/attachments/uploadQueue.slice';
import { markAllRead } from '@/features/notifications/notifications.slice';
import {
  registerPushNotifications,
  unregisterPushNotifications,
} from '@/features/notifications/pushNotifications';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { ROLE_LABELS } from '@/config/routes.config';
import { cn } from '@/shared/utils/cn';
import { env } from '@/config/env';
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  setLanguage,
  type SupportedLanguage,
} from '@/shared/i18n';
import { formatDate } from '@/shared/utils/format';

const Row = ({
  icon,
  title,
  subtitle,
  onPress,
  right,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode;
}) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    className="flex-row items-center gap-3 border-b border-ink-100 py-3.5 last:border-b-0 active:opacity-70"
  >
    <View className="h-9 w-9 items-center justify-center rounded-xl bg-ink-50">{icon}</View>
    <View className="flex-1 gap-0.5">
      <Text className="text-[14px] font-semibold text-ink-900">{title}</Text>
      {subtitle ? <Text className="text-[11px] text-ink-400">{subtitle}</Text> : null}
    </View>
    {right ?? <ChevronRight size={17} color="#9CB0A6" />}
  </Pressable>
);

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, role } = usePermission();
  const dispatch = useAppDispatch();
  const activeUploads = useAppSelector(selectActiveUploadCount);
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(isBiometricLockEnabled);

  const toggleBiometric = async (next: boolean) => {
    if (!next) {
      setBiometricLockEnabled(false);
      setBiometricEnabled(false);
      toast.success(t('profile.biometricDisabled'));
      return;
    }

    const [hasHardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);

    if (!hasHardware || !enrolled) {
      toast.error(t('profile.biometricUnavailable'));
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('biometric.prompt'),
    });

    if (result.success) {
      setBiometricLockEnabled(true);
      setBiometricEnabled(true);
      toast.success(t('profile.biometricEnabled'));
    }
  };

  const handleLogout = async () => {
    setConfirmLogout(false);
    await unregisterPushNotifications();
    dispatch(resetUploadQueue());
    dispatch(markAllRead());
    await logout();
    router.replace('/login');
  };

  return (
    <Screen>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <Card className="gap-4">
        <View className="flex-row items-center gap-4">
          <Avatar firstName={user?.firstName} lastName={user?.lastName} size="lg" />
          <View className="flex-1 gap-1">
            <Text className="text-[20px] font-bold tracking-tight text-ink-900">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text className="text-[12px] text-ink-500">{user?.email}</Text>
            <View className="mt-1 self-start rounded-full border border-jade-200 bg-jade-50 px-2.5 py-1">
              <Text className="text-[10px] font-bold uppercase tracking-wide text-jade-700">
                {ROLE_LABELS[role ?? ''] ?? role}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row gap-3 rounded-xl bg-canvas p-3">
          <View className="flex-1">
            <Text className="text-[10px] uppercase tracking-wide text-ink-400">
              {t('profile.status')}
            </Text>
            <Text className="mt-0.5 text-[12px] font-semibold text-ink-800">
              {user?.status ?? t('profile.active')}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] uppercase tracking-wide text-ink-400">
              {t('profile.lastLogin')}
            </Text>
            <Text className="mt-0.5 text-[12px] font-semibold text-ink-800">
              {formatDate(user?.lastLoginAt)}
            </Text>
          </View>
        </View>
      </Card>

      <Card className="gap-3">
        <Text className="text-[10px] uppercase tracking-wide text-ink-400">
          {t('profile.language')}
        </Text>
        <View className="flex-row gap-2">
          {SUPPORTED_LANGUAGES.map((language) => {
            const selected = i18n.language === language;
            return (
              <Pressable
                key={language}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => void setLanguage(language as SupportedLanguage)}
                className={cn(
                  'flex-1 items-center rounded-xl border px-2 py-2.5',
                  selected ? 'border-jade-500 bg-jade-50' : 'border-ink-100 bg-surface',
                )}
              >
                <Text
                  className={cn(
                    'text-[12px] font-semibold',
                    selected ? 'text-jade-700' : 'text-ink-600',
                  )}
                >
                  {LANGUAGE_LABELS[language as SupportedLanguage]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card className="py-1">
        <Row
          icon={<KeyRound size={17} color="#047857" />}
          title={t('profile.changePassword')}
          subtitle={t('profile.changePasswordHint')}
          onPress={() => router.push('/change-password')}
        />
        <Row
          icon={<FileUp size={17} color="#047857" />}
          title={t('profile.uploadQueue')}
          subtitle={
            activeUploads > 0
              ? activeUploads === 1
                ? t('profile.uploadPending', { count: activeUploads })
                : t('profile.uploadPending_plural', { count: activeUploads })
              : t('profile.uploadQueueEmpty')
          }
          onPress={() => router.push('/upload-queue')}
          right={
            activeUploads > 0 ? (
              <View className="rounded-full bg-coral-500 px-2 py-0.5">
                <Text className="text-[10px] font-bold text-white">{activeUploads}</Text>
              </View>
            ) : undefined
          }
        />
        <Row
          icon={<Bell size={17} color="#047857" />}
          title={t('profile.notifications')}
          subtitle={t('profile.notificationsHint')}
          onPress={async () => {
            const token = await registerPushNotifications();
            if (token) {
              toast.success(t('profile.enablePush'));
            } else {
              toast.info(t('profile.pushSettings'));
              void Linking.openSettings();
            }
          }}
        />
        <Row
          icon={<Fingerprint size={17} color="#047857" />}
          title={t('profile.biometric')}
          subtitle={t('profile.biometricHint')}
          onPress={() => void toggleBiometric(!biometricEnabled)}
          right={
            <Switch
              value={biometricEnabled}
              onValueChange={(value) => void toggleBiometric(value)}
              trackColor={{ false: '#DDE4E0', true: '#6EE7B7' }}
              thumbColor={biometricEnabled ? '#047857' : '#FFFFFF'}
            />
          }
        />
        <Row
          icon={<Shield size={17} color="#047857" />}
          title={t('profile.privacy')}
          subtitle={t('profile.privacyHint')}
          onPress={() => void Linking.openURL(env.privacyUrl)}
        />
      </Card>

      <View className="items-center gap-1 py-2">
        <Text className="text-[11px] uppercase tracking-[1.5px] text-ink-300">
          Manifest CRM v1.0.0 · {env.appEnv}
        </Text>
        <Text className="text-[10px] text-ink-300">
          Minimum supported {env.minSupportedVersion}
        </Text>
      </View>

      <Button
        title={t('profile.signOut')}
        variant="danger"
        icon={<LogOut size={17} color="#FFFFFF" />}
        loading={loggingOut}
        onPress={() => setConfirmLogout(true)}
      />

      <ConfirmDialog
        visible={confirmLogout}
        title={t('profile.signOutTitle')}
        message={t('profile.signOutMessage')}
        confirmLabel={t('profile.signOut')}
        destructive
        loading={loggingOut}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => void handleLogout()}
      />
    </Screen>
  );
}
