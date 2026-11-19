import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/utils/toast';
import { cn } from '@/shared/utils/cn';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export const ErrorState = ({
  error,
  onRetry,
  title = 'Could not load this view',
  className,
}: ErrorStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
      className,
    )}
  >
    <span className="grid size-10 place-items-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
      <AlertTriangle className="size-5" />
    </span>
    <div className="space-y-1">
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mx-auto max-w-md text-sm text-muted-foreground">
        {getErrorMessage(error)}
      </p>
    </div>
    {onRetry ? (
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw className="size-4" />
        Try again
      </Button>
    ) : null}
  </div>
);
