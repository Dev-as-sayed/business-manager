import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('animate-pulse rounded-sm bg-muted', className)} {...props} />
);
