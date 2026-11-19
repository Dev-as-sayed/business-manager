import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: string;
  accent?: boolean;
  className?: string;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  hint,
  accent = false,
  className,
}: StatCardProps) => (
  <Card className={cn('relative overflow-hidden p-5', className)}>
    <span
      className={cn(
        'absolute inset-x-0 top-0 h-0.5',
        accent ? 'bg-accent' : 'bg-primary/40',
      )}
      aria-hidden
    />
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="font-display text-3xl font-semibold leading-none tracking-tight">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {Icon ? (
        <span className="grid size-8 place-items-center rounded-sm border border-border bg-muted/50 text-muted-foreground">
          <Icon className="size-4" />
        </span>
      ) : null}
    </div>
  </Card>
);
