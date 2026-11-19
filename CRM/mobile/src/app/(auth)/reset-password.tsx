import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { useResetPasswordMutation } from '@/features/auth/auth.api';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/features/auth/auth.schema';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();
  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: params.token ?? '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPassword({ token: values.token, password: values.password }).unwrap();
      toast.success('Password updated. Sign in with your new password.');
      router.replace('/login');
    } catch {
      return;
    }
  });

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      subtitle="Use at least 8 characters and avoid reusing a password from another service."
      footer={
        <Text className="text-center text-[12px] text-ink-400">
          <Text className="font-semibold text-jade-700" onPress={() => router.replace('/login')}>
            Back to sign in
          </Text>
        </Text>
      }
    >
      <View className="gap-4">
        <Controller
          control={control}
          name="token"
          render={({ field, fieldState }) => (
            <TextField
              label="Reset token"
              placeholder="Paste the token from your email"
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              right={<LockKeyhole size={17} color="#9CB0A6" />}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              label="New password"
              placeholder="At least 8 characters"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
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

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <TextField
              label="Confirm new password"
              placeholder="Repeat the new password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        {error ? (
          <Text className="text-[12px] font-medium text-coral-700">{error.message}</Text>
        ) : null}

        <Button title="Update password" loading={isLoading} onPress={() => void onSubmit()} />
      </View>
    </AuthShell>
  );
}
