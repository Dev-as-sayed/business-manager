import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

interface ResultPageProps {
  code: string;
  title: string;
  description: string;
  actions?: ReactNode;
  homeTo?: string;
}

export const ResultPage = ({
  code,
  title,
  description,
  actions,
  homeTo = '/',
}: ResultPageProps) => (
  <div className="manifest-grid flex min-h-[70svh] items-center justify-center px-6 text-foreground">
    <div className="w-full max-w-lg rounded-lg border border-border bg-card p-8 shadow-sm">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">{code}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {actions ?? (
          <Button asChild>
            <Link to={homeTo}>Back to the desk</Link>
          </Button>
        )}
      </div>
      <div className="manifest-rule mt-8 h-px w-full text-muted-foreground" aria-hidden />
    </div>
  </div>
);
