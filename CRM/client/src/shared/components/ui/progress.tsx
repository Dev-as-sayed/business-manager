import * as ProgressPrimitive from '@radix-ui/react-progress';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';

export const Progress = ({
  className,
  value,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root>) => (
  <ProgressPrimitive.Root
    className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-transform"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
);
