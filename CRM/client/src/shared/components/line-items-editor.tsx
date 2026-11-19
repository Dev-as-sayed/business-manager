import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/utils/cn';

export interface EditableLineItem {
  key: string;
  name: string;
  description: string;
  quantity: string;
  price: string;
  notes: string;
}

export const createEmptyLineItem = (): EditableLineItem => ({
  key: crypto.randomUUID(),
  name: '',
  description: '',
  quantity: '1',
  price: '',
  notes: '',
});

interface LineItemsEditorProps {
  items: EditableLineItem[];
  onChange: (items: EditableLineItem[]) => void;
  priceLabel: string;
  priceHint?: string;
  addLabel?: string;
  className?: string;
}

export const LineItemsEditor = ({
  items,
  onChange,
  priceLabel,
  priceHint,
  addLabel = 'Add line',
  className,
}: LineItemsEditorProps) => {
  const updateItem = (key: string, patch: Partial<EditableLineItem>) => {
    onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const removeItem = (key: string) => {
    onChange(items.filter((item) => item.key !== key));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="hidden grid-cols-[1.4fr_1fr_5.5rem_7.5rem_2.5rem] gap-2 px-1 md:grid">
        <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Item
        </Label>
        <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Description
        </Label>
        <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Qty
        </Label>
        <Label className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {priceLabel}
        </Label>
        <span />
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.key}
            className="grid gap-2 rounded-md border border-border bg-muted/20 p-3 md:grid-cols-[1.4fr_1fr_5.5rem_7.5rem_2.5rem] md:items-center md:border-0 md:bg-transparent md:p-0"
          >
            <div className="flex items-center gap-1.5">
              <GripVertical className="hidden size-4 shrink-0 text-muted-foreground/40 md:block" aria-hidden />
              <Input
                value={item.name}
                onChange={(event) => updateItem(item.key, { name: event.target.value })}
                placeholder={`Item ${index + 1}`}
                aria-label={`Item ${index + 1} name`}
                className="h-9"
              />
            </div>
            <Input
              value={item.description}
              onChange={(event) => updateItem(item.key, { description: event.target.value })}
              placeholder="Specification, colour…"
              aria-label={`Item ${index + 1} description`}
              className="h-9"
            />
            <div className="grid grid-cols-[1fr_1fr] gap-2 md:contents">
              <Input
                type="number"
                min={1}
                step={1}
                value={item.quantity}
                onChange={(event) => updateItem(item.key, { quantity: event.target.value })}
                aria-label={`Item ${index + 1} quantity`}
                className="h-9 font-mono text-xs"
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                value={item.price}
                onChange={(event) => updateItem(item.key, { price: event.target.value })}
                aria-label={`Item ${index + 1} ${priceLabel}`}
                placeholder="0.00"
                className="h-9 font-mono text-xs"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeItem(item.key)}
              aria-label={`Remove item ${index + 1}`}
              disabled={items.length === 1}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, createEmptyLineItem()])}
          disabled={items.length >= 100}
        >
          <Plus className="size-4" />
          {addLabel}
        </Button>
        {priceHint ? <p className="text-xs text-muted-foreground">{priceHint}</p> : null}
      </div>
    </div>
  );
};
