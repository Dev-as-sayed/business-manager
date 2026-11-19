import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em]',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        success:
          'border-emerald-700/20 bg-emerald-500/10 text-emerald-800 dark:border-emerald-400/20 dark:text-emerald-300',
        warning:
          'border-amber-700/20 bg-amber-500/10 text-amber-800 dark:border-amber-400/20 dark:text-amber-300',
        danger:
          'border-red-700/20 bg-red-500/10 text-red-800 dark:border-red-400/20 dark:text-red-300',
        info: 'border-sky-700/20 bg-sky-500/10 text-sky-800 dark:border-sky-400/20 dark:text-sky-300',
        neutral: 'border-border bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { badgeVariants };
