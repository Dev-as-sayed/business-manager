import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AppState, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { selectAuthStatus } from '@/features/auth/auth.slice';
import { useAppSelector } from '@/store/hooks';
import { readCache, writeCache } from '@/shared/storage/cacheStorage';
import { Button } from '@/shared/components/Button';

const BIOMETRIC_KEY = 'manifest-biometric-lock';

export const isBiometricLockEnabled = (): boolean => readCache(BIOMETRIC_KEY) === '1';

export const setBiometricLockEnabled = (enabled: boolean): void => {
  writeCache(BIOMETRIC_KEY, enabled ? '1' : '0');
};

export const BiometricGate = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const status = useAppSelector(selectAuthStatus);
  const [enabled] = useState(isBiometricLockEnabled);
  const [unlocked, setUnlocked] = useState(() => !enabled);
  const [checking, setChecking] = useState(false);

  const unlock = useCallback(async () => {
    if (!enabled) {
      setUnlocked(true);
      return;
    }

    setChecking(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric.prompt'),
        fallbackLabel: t('biometric.fallback'),
      });

      if (result.success) {
        setUnlocked(true);
      }
    } finally {
      setChecking(false);
    }
  }, [enabled, t]);

  useEffect(() => {
    if (status === 'authenticated' && enabled && !unlocked) {
      // Prompting for biometrics is an external-system effect, not derived state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void unlock();
    }
  }, [enabled, status, unlock, unlocked]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (enabled && state !== 'active') {
        setUnlocked(false);
      }
    });

    return () => subscription.remove();
  }, [enabled]);

  if (status === 'authenticated' && !unlocked) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-canvas px-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-jade-50">
          <Fingerprint size={30} color="#047857" />
        </View>
        <Text className="text-center text-[22px] font-bold text-ink-900">
          {t('biometric.title')}
        </Text>
        <Text className="text-center text-[13px] leading-5 text-ink-500">
          {t('biometric.subtitle')}
        </Text>
        <Button title={t('biometric.unlock')} loading={checking} onPress={() => void unlock()} />
      </View>
    );
  }

  return <>{children}</>;
};
