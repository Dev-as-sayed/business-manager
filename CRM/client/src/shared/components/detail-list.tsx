import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';

export interface DetailItem {
  label: string;
  value: ReactNode;
  span?: 1 | 2;
  mono?: boolean;
}

interface DetailListProps {
  items: DetailItem[];
  className?: string;
}

export const DetailList = ({ items, className }: DetailListProps) => (
  <dl className={cn('grid gap-x-6 gap-y-4 sm:grid-cols-2', className)}>
    {items.map((item) => (
      <div key={item.label} className={cn('space-y-1', item.span === 2 && 'sm:col-span-2')}>
        <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {item.label}
        </dt>
        <dd
          className={cn(
            'break-words text-sm text-foreground',
            item.mono && 'font-mono text-[13px]',
          )}
        >
          {item.value ?? '—'}
        </dd>
      </div>
    ))}
  </dl>
);

interface DetailSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const DetailSection = ({
  title,
  action,
  children,
  className,
  contentClassName,
}: DetailSectionProps) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
      <CardTitle className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </CardTitle>
      {action}
    </CardHeader>
    <CardContent className={contentClassName}>{children}</CardContent>
  </Card>
);
