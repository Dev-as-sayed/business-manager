import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export const DropdownMenuContent = ({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-44 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuItem = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

export const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) => (
  <DropdownMenuPrimitive.CheckboxItem
    checked={checked}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="size-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
);

export const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) => (
  <DropdownMenuPrimitive.Label
    className={cn(
      'px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);

export const DropdownMenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
);
