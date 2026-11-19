import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useChangePasswordMutation } from '@/features/auth/auth.api';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/features/auth/auth.schema';
import { PageHeader, Screen } from '@/shared/components/Screen';
import { Button } from '@/shared/components/Button';
import { TextField } from '@/shared/components/TextField';

export default function ChangePasswordScreen() {
  const [show, setShow] = useState(false);
  const [changePassword, { isLoading, error }] = useChangePasswordMutation();
  const { control, handleSubmit } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      router.replace('/login');
    } catch {
      return;
    }
  });

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <Button title="Update password" loading={isLoading} onPress={() => void onSubmit()} />
      }
    >
      <PageHeader
        title="Change password"
        subtitle="You will be signed out on every device after changing your password."
        back={() => router.back()}
      />

      <View className="gap-4">
        <Controller
          control={control}
          name="currentPassword"
          render={({ field, fieldState }) => (
            <TextField
              label="Current password"
              secureTextEntry={!show}
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <TextField
              label="New password"
              placeholder="At least 8 characters"
              secureTextEntry={!show}
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <TextField
              label="Confirm new password"
              secureTextEntry={!show}
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={show ? 'Hide passwords' : 'Show passwords'}
                  onPress={() => setShow((current) => !current)}
                  className="h-8 w-8 items-center justify-center"
                >
                  {show ? <EyeOff size={18} color="#526C60" /> : <Eye size={18} color="#526C60" />}
                </Pressable>
              }
            />
          )}
        />
        {error ? (
          <Text className="text-[12px] font-medium text-coral-700">{error.message}</Text>
        ) : null}
      </View>
    </Screen>
  );
}
