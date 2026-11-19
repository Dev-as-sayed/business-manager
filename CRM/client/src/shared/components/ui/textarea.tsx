import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export const Textarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cn(
      'flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
      className,
    )}
    {...props}
  />
);
