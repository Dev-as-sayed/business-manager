import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { useForgotPasswordMutation } from '@/features/auth/auth.api';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/features/auth/auth.schema';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState<{ token?: string; email: string } | null>(null);
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();
  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await forgotPassword(values).unwrap();
      setSent({ token: result?.token, email: values.email });
    } catch {
      return;
    }
  });

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="Enter the email address tied to your account. We will send a secure reset link that expires shortly."
      footer={
        <Text className="text-center text-[12px] text-ink-400">
          Remembered it?{' '}
          <Text className="font-semibold text-jade-700" onPress={() => router.replace('/login')}>
            Back to sign in
          </Text>
        </Text>
      }
    >
      {sent ? (
        <View className="gap-4">
          <View className="rounded-card border border-jade-200 bg-jade-50 p-4">
            <Text className="text-[15px] font-semibold text-jade-800">Check your inbox</Text>
            <Text className="mt-1 text-[13px] leading-5 text-jade-700">
              If {sent.email} matches an account, a reset link is on its way.
            </Text>
          </View>

          {sent.token ? (
            <Button
              title="Continue to reset"
              onPress={() =>
                router.push({
                  pathname: '/reset-password',
                  params: { token: sent.token },
                })
              }
            />
          ) : null}

          <Button title="Use another email" variant="secondary" onPress={() => setSent(null)} />
        </View>
      ) : (
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
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                right={<Mail size={17} color="#9CB0A6" />}
              />
            )}
          />

          {error ? (
            <Text className="text-[12px] font-medium text-coral-700">{error.message}</Text>
          ) : null}

          <Button title="Send reset link" loading={isLoading} onPress={() => void onSubmit()} />
        </View>
      )}
    </AuthShell>
  );
}
