"use client";

import { useToast } from "@/context/ToastProvider";
import { cn } from "@/lib/utils";

export function PlaceholderLink({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { toast } = useToast();

  return (
    <button
      type="button"
      aria-label={`${label} (placeholder link)`}
      title={`${label} — placeholder link`}
      onClick={() =>
        toast(
          "info",
          `${label} is a placeholder link. Add the real URL before launch.`,
        )
      }
      className={cn("inline-flex items-center gap-2", className)}
    >
      {children}
    </button>
  );
}
