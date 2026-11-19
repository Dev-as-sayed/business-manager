import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';

export const Label = ({
  className,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root>) => (
  <LabelPrimitive.Root
    className={cn(
      'font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground',
      className,
    )}
    {...props}
  />
);
