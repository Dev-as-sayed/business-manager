import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';

export const Avatar = ({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Root>) => (
  <AvatarPrimitive.Root
    className={cn(
      'relative flex size-9 shrink-0 overflow-hidden rounded-full border border-border',
      className,
    )}
    {...props}
  />
);

export const AvatarImage = ({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image className={cn('aspect-square size-full', className)} {...props} />
);

export const AvatarFallback = ({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    className={cn(
      'flex size-full items-center justify-center bg-secondary font-mono text-xs font-medium text-secondary-foreground',
      className,
    )}
    {...props}
  />
);
