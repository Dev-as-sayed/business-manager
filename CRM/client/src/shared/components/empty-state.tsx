import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const EmptyState = ({ title, description, action, icon, className }: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
      className,
    )}
  >
    <span className="grid size-10 place-items-center rounded-full border border-border bg-muted text-muted-foreground">
      {icon ?? <Inbox className="size-5" />}
    </span>
    <div className="space-y-1">
      <p className="font-display text-base font-semibold">{title}</p>
      {description ? (
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
    {action}
  </div>
);
