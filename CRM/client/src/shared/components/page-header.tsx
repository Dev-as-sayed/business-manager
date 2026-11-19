import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  eyebrow,
  actions,
  backTo,
  backLabel = 'Back',
  className,
}: PageHeaderProps) => (
  <header className={cn('flex flex-col gap-4', className)}>
    {backTo ? (
      <Link
        to={backTo}
        className="inline-flex w-fit items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {backLabel}
      </Link>
    ) : null}

    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        {eyebrow ? (
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
            <span className="inline-block size-1.5 bg-accent" aria-hidden />
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-balance font-display text-2xl font-semibold leading-tight sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>

    <div className="h-px w-full bg-border" />
  </header>
);
