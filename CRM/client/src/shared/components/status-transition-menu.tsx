import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { labelForStatus } from '@/shared/utils/status';

interface StatusTransitionMenuProps {
  currentStatus: string;
  transitions: Record<string, string[]>;
  onSelect: (status: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
}

export const StatusTransitionMenu = ({
  currentStatus,
  transitions,
  onSelect,
  isLoading = false,
  disabled = false,
  label = 'Change status',
}: StatusTransitionMenuProps) => {
  const nextStatuses = transitions[currentStatus] ?? [];

  if (nextStatuses.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isLoading}>
          {isLoading ? 'Updating…' : label}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        {nextStatuses.map((status) => (
          <DropdownMenuItem key={status} onSelect={() => onSelect(status)}>
            {labelForStatus(status)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
