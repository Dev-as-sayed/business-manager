import { env } from '@/app/env';

export const SplashScreen = ({ label = 'Restoring session' }: { label?: string }) => (
  <div className="manifest-grid flex min-h-svh items-center justify-center bg-background px-6 text-foreground">
    <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-md bg-sidebar font-display text-lg font-bold text-sidebar-foreground">
          M
        </span>
        <div className="text-left">
          <p className="font-display text-lg font-semibold leading-none">{env.VITE_APP_NAME}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Trade operations desk
          </p>
        </div>
      </div>

      <div className="flex w-full items-center gap-2" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="size-1.5 rounded-full bg-accent" />
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
    </div>
  </div>
);
