import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Eye, EyeOff, KeyRound, Mail } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { useLoginMutation } from '@/features/auth/auth.api';
import { loginSchema, type LoginFormValues } from '@/features/auth/auth.schema';
import { getHomeForRole } from '@/config/routes.config';
import { selectIntendedPath, setIntendedPath } from '@/features/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { env } from '@/config/env';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ next?: string }>();
  const dispatch = useAppDispatch();
  const intendedPath = useAppSelector(selectIntendedPath);
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading, error }] = useLoginMutation();
  const { control, handleSubmit, setValue } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login(values).unwrap();
      toast.success(`Welcome back, ${result.user.firstName}`);
      const next = params.next ?? intendedPath;
      dispatch(setIntendedPath(null));
      router.replace((next?.startsWith('/') ? next : getHomeForRole(result.user.role)) as Href);
    } catch {
      return;
    }
  });

  return (
    <AuthShell
      eyebrow="Export operations"
      title="Sign in to Manifest CRM"
      subtitle="Track product requests, quotations, production, quality checks, and shipments from one shared workspace."
      footer={
        <View className="gap-3">
          <Text className="text-center text-[12px] text-ink-400">
            Forgot your password?{' '}
            <Text
              className="font-semibold text-jade-700"
              onPress={() => router.push('/forgot-password')}
            >
              Reset it
            </Text>
          </Text>
          <Text className="text-center text-[11px] uppercase tracking-[1.5px] text-ink-300">
            {env.appEnv} · v1.0.0
          </Text>
        </View>
      }
    >
      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              label="Email"
              placeholder="you@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              right={<Mail size={17} color="#9CB0A6" />}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  onPress={() => setShowPassword((current) => !current)}
                  className="h-8 w-8 items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#526C60" />
                  ) : (
                    <Eye size={18} color="#526C60" />
                  )}
                </Pressable>
              }
            />
          )}
        />

        {error ? (
          <View className="rounded-xl border border-coral-200 bg-coral-50 px-3 py-2.5">
            <Text className="text-[12px] font-medium text-coral-700">{error.message}</Text>
          </View>
        ) : null}

        <Button
          title="Sign in"
          icon={<KeyRound size={18} color="#FFFFFF" />}
          loading={isLoading}
          onPress={() => void onSubmit()}
          className="mt-1"
        />

        {env.appEnv !== 'production' ? (
          <Pressable
            onPress={() => {
              setValue('email', 'admin@crm.local');
              setValue('password', 'ChangeMe123!');
            }}
            className="self-center rounded-full border border-dashed border-ink-200 px-3 py-1.5"
          >
            <Text className="text-[11px] font-medium text-ink-500">Dev demo · admin@crm.local</Text>
          </Pressable>
        ) : null}
      </View>
    </AuthShell>
  );
}
