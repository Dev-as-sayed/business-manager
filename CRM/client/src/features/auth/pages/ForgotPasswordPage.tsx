import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/auth.schema';
import { useForgotPasswordMutation } from '@/features/auth/auth.api';
import { TextField } from '@/shared/components/form-fields';
import { Button } from '@/shared/components/ui/button';
import { toastApiError } from '@/shared/utils/toast';

export const ForgotPasswordPage = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await forgotPassword(values).unwrap();
      setResetToken(result?.token ?? null);
      setSent(true);
    } catch (error) {
      toastApiError(error);
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Account recovery
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the email on your account and we will issue a reset link.
        </p>
      </div>

      {sent ? (
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <span className="grid size-9 place-items-center rounded-full bg-accent/10 text-accent">
            <Mail className="size-4" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">Request received</p>
            <p className="text-sm text-muted-foreground">
              If that email belongs to an active account, a reset link is on its way.
            </p>
          </div>
          {resetToken ? (
            <Button asChild className="w-full">
              <Link to={`/reset-password?token=${encodeURIComponent(resetToken)}`}>
                Continue to reset password
              </Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild className="w-full">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <FormProvider {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <TextField
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        </FormProvider>
      )}

      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </div>
  );
};
