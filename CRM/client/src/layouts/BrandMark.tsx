import { env } from '@/app/env';
import { cn } from '@/shared/utils/cn';

interface BrandMarkProps {
  compact?: boolean;
  inverted?: boolean;
  className?: string;
}

export const BrandMark = ({ compact = false, inverted = false, className }: BrandMarkProps) => (
  <div className={cn('flex items-center gap-3', className)}>
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-md font-display text-base font-bold',
        inverted ? 'bg-sidebar-foreground text-sidebar' : 'bg-sidebar text-sidebar-foreground',
      )}
      aria-hidden
    >
      M
    </span>
    {!compact ? (
      <div className="min-w-0">
        <p
          className={cn(
            'truncate font-display text-sm font-semibold leading-none tracking-tight',
            inverted ? 'text-sidebar-foreground' : 'text-foreground',
          )}
        >
          {env.VITE_APP_NAME}
        </p>
        <p
          className={cn(
            'mt-1 font-mono text-[9px] uppercase tracking-[0.22em]',
            inverted ? 'text-sidebar-muted' : 'text-muted-foreground',
          )}
        >
          Trade operations
        </p>
      </div>
    ) : null}
  </div>
);
