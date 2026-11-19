import { formatDateTime } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

export interface TimelineItem {
  label: string;
  at?: string | null;
  note?: string;
}

interface StatusTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const StatusTimeline = ({ items, className }: StatusTimelineProps) => (
  <ol className={cn('relative space-y-0', className)}>
    {items.map((item, index) => {
      const done = Boolean(item.at);
      const last = index === items.length - 1;

      return (
        <li key={item.label} className="relative flex gap-3 pb-5 last:pb-0">
          {!last ? (
            <span
              className={cn(
                'absolute left-[5px] top-3 h-full w-px',
                done ? 'bg-primary/30' : 'bg-border',
              )}
              aria-hidden
            />
          ) : null}
          <span
            className={cn(
              'relative z-10 mt-1 size-3 shrink-0 rounded-full border-2 bg-background',
              done ? 'border-primary bg-primary' : 'border-border',
            )}
            aria-hidden
          />
          <div className="min-w-0 space-y-0.5">
            <p
              className={cn(
                'font-mono text-[10px] uppercase tracking-[0.16em]',
                done ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {done ? formatDateTime(item.at) : 'Pending'}
              {item.note ? ` · ${item.note}` : ''}
            </p>
          </div>
        </li>
      );
    })}
  </ol>
);
