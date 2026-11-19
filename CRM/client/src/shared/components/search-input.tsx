import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
  ariaLabel?: string;
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search…',
  className,
  delay = 350,
  ariaLabel = 'Search',
}: SearchInputProps) => {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, delay);
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (debounced !== lastEmitted.current) {
      lastEmitted.current = debounced;
      onChange(debounced);
    }
  }, [debounced, onChange]);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setLocal(value);
    }
  }, [value]);

  return (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={local}
        onChange={(event) => setLocal(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pl-9 pr-9"
      />
      {local ? (
        <button
          type="button"
          onClick={() => setLocal('')}
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
};
