import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/auth.schema';
import { useResetPasswordMutation } from '@/features/auth/auth.api';
import { TextField } from '@/shared/components/form-fields';
import { Button } from '@/shared/components/ui/button';
import { applyServerFieldErrors, toastApiError } from '@/shared/utils/toast';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await resetPassword({ token: values.token, password: values.password }).unwrap();
      navigate('/login', { replace: true });
    } catch (error) {
      if (applyServerFieldErrors(error, form.setError)) return;
      toastApiError(error);
    }
  });

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Account recovery
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Reset link missing</h1>
          <p className="text-sm text-muted-foreground">
            Open the reset link from your email, or request a new one.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Account recovery
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a password between 8 and 72 characters.
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <input type="hidden" {...form.register('token')} />
          <TextField
            name="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            required
          />
          <TextField
            name="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            <KeyRound className="size-4" />
            {isLoading ? 'Saving…' : 'Reset password'}
          </Button>
        </form>
      </FormProvider>

      <Link
        to="/login"
        className="text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
      >
        Back to sign in
      </Link>
    </div>
  );
};
