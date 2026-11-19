import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export const Input = ({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type={type}
    className={cn(
      'flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm text-foreground shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
      className,
    )}
    {...props}
  />
);
