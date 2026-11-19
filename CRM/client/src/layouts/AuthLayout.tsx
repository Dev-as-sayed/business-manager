import { Moon, Sun } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { env } from '@/app/env';
import { selectAuthStatus, selectAuthUser } from '@/features/auth/auth.slice';
import { BrandMark } from '@/layouts/BrandMark';
import { SplashScreen } from '@/shared/components/splash-screen';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/shared/hooks/useTheme';
import { getDefaultRoute, roleLabel } from '@/shared/utils/roles';

const RouteLine = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-muted">
      <span>Dhaka</span>
      <span>Guangzhou</span>
      <span>Chattogram</span>
    </div>
    <div className="relative h-px bg-sidebar-foreground/20">
      <span className="absolute -top-1 left-0 size-2 rounded-full border border-sidebar-foreground/50 bg-sidebar" />
      <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full border border-accent bg-accent" />
      <span className="absolute -top-1 right-0 size-2 rounded-full border border-sidebar-foreground/50 bg-sidebar" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Quotation', value: 'Sent' },
        { label: 'Production', value: 'Running' },
        { label: 'Customs', value: 'Cleared' },
      ].map((item) => (
        <div key={item.label} className="space-y-1 border-l border-sidebar-foreground/15 pl-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-sidebar-muted">
            {item.label}
          </p>
          <p className="font-display text-sm font-medium text-sidebar-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  </div>
);

export const AuthLayout = () => {
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthUser);
  const { theme, toggleTheme } = useTheme();

  if (status === 'idle' || status === 'loading') {
    return <SplashScreen />;
  }

  if (status === 'authenticated' && user) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <div className="flex w-full flex-col lg:w-[52%]">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10">
          <BrandMark />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-14 sm:px-10">
          <div className="page-enter w-full max-w-md">
            <Outlet />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:px-10">
          <span>{env.VITE_APP_NAME} / v0.1</span>
          <span>Secure desk access</span>
        </div>
      </div>

      <aside className="manifest-grid relative hidden flex-1 flex-col justify-between overflow-hidden border-l border-border bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-muted">
          <span>Manifest 0248 / live desk</span>
          <span className="inline-flex items-center gap-2 text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            Trading
          </span>
        </div>

        <div className="max-w-lg space-y-8">
          <div className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-sidebar-muted">
              Sourcing · quality · freight
            </p>
            <h2 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight">
              Every enquiry leaves a paper trail.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-sidebar-foreground/70">
              Follow a request from the first quote to customs clearance. One desk for sales,
              suppliers, inspectors and accounts.
            </p>
          </div>

          <RouteLine />

          <div className="rounded-md border border-sidebar-foreground/15 bg-sidebar-active/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-sidebar-muted">
                  Sample consignment
                </p>
                <p className="mt-1 font-display text-sm font-medium">FY-2026 / 014</p>
              </div>
              <span className="rounded-sm border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent">
                Cleared
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-sidebar-muted">
              <div>
                <p>Cartons</p>
                <p className="mt-1 text-sm text-sidebar-foreground">128</p>
              </div>
              <div>
                <p>Value</p>
                <p className="mt-1 text-sm text-sidebar-foreground">$24,860</p>
              </div>
              <div>
                <p>ETA</p>
                <p className="mt-1 text-sm text-sidebar-foreground">12 Nov</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-sidebar-muted">
          <span>{roleLabel('ADMIN')} · {roleLabel('SALES')} · {roleLabel('FINANCE')}</span>
          <span>Authorized access only</span>
        </div>
      </aside>
    </div>
  );
};
