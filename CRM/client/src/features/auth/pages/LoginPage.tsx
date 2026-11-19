import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/auth.schema';
import { useLoginMutation } from '@/features/auth/auth.api';
import { TextField } from '@/shared/components/form-fields';
import { Button } from '@/shared/components/ui/button';
import { getDefaultRoute } from '@/shared/utils/roles';
import { toastApiError } from '@/shared/utils/toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await login(values).unwrap();
      navigate(getDefaultRoute(result.user.role), { replace: true });
    } catch (error) {
      setFormError('Email or password is incorrect.');
      toastApiError(error);
    }
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Secure desk access
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Use your workspace credentials to open the manifest.
        </p>
      </div>

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
          <TextField
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />

          {formError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </FormProvider>

      <div className="flex items-center justify-between text-sm">
        <Link
          to="/forgot-password"
          className="text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
        >
          Forgot password?
        </Link>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Accounts are provisioned by admins
        </span>
      </div>
    </div>
  );
};
