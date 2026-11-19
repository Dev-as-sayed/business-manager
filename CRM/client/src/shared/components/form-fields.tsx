import type { ReactNode } from 'react';
import { Controller, useFormContext, type FieldValues, type Path } from 'react-hook-form';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import type { SelectOption } from '@/shared/types';
import { cn } from '@/shared/utils/cn';

interface BaseFieldProps {
  name: string;
  label?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const getError = (errors: unknown, name: string): string | undefined => {
  const segments = name.split('.');
  let current: unknown = errors;

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  if (typeof current === 'object' && current !== null && 'message' in current) {
    const message = (current as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  }

  return undefined;
};

const FieldShell = ({
  name,
  label,
  hint,
  required,
  error,
  className,
  children,
}: BaseFieldProps & { error?: string; children: ReactNode }) => (
  <div className={cn('space-y-1.5', className)}>
    {label ? (
      <Label htmlFor={name}>
        {label}
        {required ? <span className="ml-1 text-accent">*</span> : null}
      </Label>
    ) : null}
    {children}
    {error ? (
      <p className="text-xs text-destructive" role="alert">
        {error}
      </p>
    ) : hint ? (
      <p className="text-xs text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);

interface TextFieldProps extends BaseFieldProps {
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'date' | 'number' | 'url';
  autoComplete?: string;
  step?: string;
  min?: string | number;
  max?: string | number;
}

export const TextField = ({
  name,
  label,
  hint,
  required,
  className,
  disabled,
  placeholder,
  type = 'text',
  autoComplete,
  step,
  min,
  max,
}: TextFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = getError(errors, name);

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      required={required}
      error={error}
      className={className}
    >
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        aria-invalid={error ? true : undefined}
        {...register(name)}
      />
    </FieldShell>
  );
};

export const TextareaField = ({
  name,
  label,
  hint,
  required,
  className,
  disabled,
  placeholder,
  rows = 4,
}: TextFieldProps & { rows?: number }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = getError(errors, name);

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      required={required}
      error={error}
      className={className}
    >
      <Textarea
        id={name}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        {...register(name)}
      />
    </FieldShell>
  );
};

interface SelectFieldProps extends BaseFieldProps {
  options: SelectOption[];
  placeholder?: string;
  allowClear?: boolean;
  onValueChange?: (value: string) => void;
}

export const SelectField = ({
  name,
  label,
  hint,
  required,
  className,
  disabled,
  options,
  placeholder = 'Select…',
  allowClear = false,
  onValueChange,
}: SelectFieldProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = getError(errors, name);

  return (
    <FieldShell
      name={name}
      label={label}
      hint={hint}
      required={required}
      error={error}
      className={className}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value = typeof field.value === 'string' ? field.value : '';

          return (
            <Select
              value={value || undefined}
              disabled={disabled}
              onValueChange={(next) => {
                const resolved = next === '__clear__' ? '' : next;
                field.onChange(resolved);
                onValueChange?.(resolved);
              }}
            >
              <SelectTrigger id={name} aria-invalid={error ? true : undefined}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {allowClear ? <SelectItem value="__clear__">None</SelectItem> : null}
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }}
      />
    </FieldShell>
  );
};

export const CheckboxField = ({
  name,
  label,
  hint,
  className,
  disabled,
}: Omit<BaseFieldProps, 'required'>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = getError(errors, name);

  return (
    <div className={cn('space-y-1.5', className)}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <Checkbox
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={disabled}
            />
            <span>
              <span className="font-medium">{label}</span>
              {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
            </span>
          </label>
        )}
      />
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export const FieldGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={cn('grid gap-4 sm:grid-cols-2', className)}>{children}</div>;

export type FormPath<T extends FieldValues> = Path<T>;
