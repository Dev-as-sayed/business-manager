import { Badge, type BadgeProps } from '@/shared/components/ui/badge';
import { labelForStatus, statusTone } from '@/shared/utils/status';
import { cn } from '@/shared/utils/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
  withDot?: boolean;
}

const toneToVariant: Record<string, NonNullable<BadgeProps['variant']>> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  neutral: 'neutral',
};

export const StatusBadge = ({ status, className, withDot = true }: StatusBadgeProps) => {
  const tone = statusTone(status);

  return (
    <Badge variant={toneToVariant[tone]} className={cn('w-fit', className)}>
      {withDot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {labelForStatus(status)}
    </Badge>
  );
};
