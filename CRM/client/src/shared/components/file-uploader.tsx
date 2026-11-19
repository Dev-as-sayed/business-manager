import { FileText, Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { formatFileSize } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

interface FileUploaderProps {
  onUpload: (files: File[]) => void | Promise<void>;
  isUploading?: boolean;
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  hint?: string;
  className?: string;
}

interface SelectedFile {
  file: File;
  preview?: string;
}

export const FileUploader = ({
  onUpload,
  isUploading = false,
  accept = 'image/*,application/pdf',
  maxSizeMb = 10,
  multiple = true,
  disabled = false,
  label = 'Drop files here or browse',
  hint,
  className,
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(
    () => () => {
      for (const preview of previewsRef.current) URL.revokeObjectURL(preview);
      previewsRef.current = [];
    },
    [],
  );

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;

    setLocalError(null);
    const incoming = Array.from(files);
    const oversized = incoming.find((file) => file.size > maxSizeMb * 1024 * 1024);

    if (oversized) {
      setLocalError(`${oversized.name} is larger than ${maxSizeMb}MB.`);
      return;
    }

    const next = incoming.map((file) => {
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      if (preview) previewsRef.current.push(preview);
      return { file, preview };
    });

    setSelected((current) => (multiple ? [...current, ...next] : next.slice(0, 1)));
  };

  const removeFile = (index: number) => {
    setSelected((current) => {
      const item = current[index];
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
        previewsRef.current = previewsRef.current.filter((preview) => preview !== item.preview);
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) addFiles(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (selected.length === 0) return;
    await onUpload(selected.map((item) => item.file));
    for (const item of selected) {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
        previewsRef.current = previewsRef.current.filter((preview) => preview !== item.preview);
      }
    }
    setSelected([]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-6 py-8 text-center transition-colors',
          dragging && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground">
          <UploadCloud className="size-4" />
        </span>
        <p className="text-sm font-medium">{label}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {hint ?? `Up to ${maxSizeMb}MB per file`}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {localError ? (
        <p className="text-xs text-destructive" role="alert">
          {localError}
        </p>
      ) : null}

      {selected.length > 0 ? (
        <ul className="space-y-2">
          {selected.map((item, index) => (
            <li
              key={`${item.file.name}-${index}`}
              className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
            >
              {item.preview ? (
                <img
                  src={item.preview}
                  alt=""
                  className="size-9 rounded-sm border border-border object-cover"
                />
              ) : (
                <span className="grid size-9 place-items-center rounded-sm bg-muted text-muted-foreground">
                  {item.file.type.startsWith('image/') ? (
                    <ImageIcon className="size-4" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {formatFileSize(item.file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeFile(index)}
                disabled={isUploading}
                aria-label={`Remove ${item.file.name}`}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {isUploading ? <Progress value={65} aria-label="Uploading files" /> : null}

      <Button
        type="button"
        size="sm"
        onClick={handleUpload}
        disabled={selected.length === 0 || isUploading || disabled}
      >
        <UploadCloud className="size-4" />
        {isUploading
          ? 'Uploading…'
          : `Upload${selected.length > 1 ? ` ${selected.length} files` : ' file'}`}
      </Button>
    </div>
  );
};
