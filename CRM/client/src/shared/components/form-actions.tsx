import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';

interface FormActionsProps {
  cancelTo: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}

export const FormActions = ({
  cancelTo,
  submitLabel = 'Save changes',
  isSubmitting = false,
  className,
}: FormActionsProps) => (
  <div
    className={cn(
      'flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end',
      className,
    )}
  >
    <Button type="button" variant="outline" asChild>
      <Link to={cancelTo}>Cancel</Link>
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Saving…' : submitLabel}
    </Button>
  </div>
);
