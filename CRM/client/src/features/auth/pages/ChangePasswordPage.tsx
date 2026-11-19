import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/features/auth/auth.schema';
import { useChangePasswordMutation } from '@/features/auth/auth.api';
import { FormActions } from '@/shared/components/form-actions';
import { TextField } from '@/shared/components/form-fields';
import { PageHeader } from '@/shared/components/page-header';
import { Card, CardContent } from '@/shared/components/ui/card';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';

export const ChangePasswordPage = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      form.reset();
    } catch (error) {
      if (applyServerFieldErrors(error, form.setError)) return;
      toastApiError(error);
    }
  });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeader
        backTo="/profile"
        backLabel="Back to profile"
        eyebrow="Account security"
        title="Change password"
        description="Use at least 8 characters. The new password takes effect immediately."
      />

      <Card>
        <CardContent className="pt-5">
          <FormProvider {...form}>
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <TextField
                name="currentPassword"
                label="Current password"
                type="password"
                autoComplete="current-password"
                required
              />
              <TextField
                name="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
                required
              />
              <TextField
                name="confirmPassword"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                required
              />

              <FormActions
                cancelTo="/profile"
                submitLabel="Update password"
                isSubmitting={isLoading || form.formState.isSubmitting}
              />
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Forgot your current password?{' '}
        <Link
          to="/forgot-password"
          className="underline decoration-border underline-offset-4 hover:text-foreground"
        >
          Request a reset link
        </Link>
        .
      </p>
    </div>
  );
};
