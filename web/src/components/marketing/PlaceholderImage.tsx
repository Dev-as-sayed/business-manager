import type { ReactNode } from "react";

export default function PlaceholderImage({
  label,
  hint,
  className = "",
  aspect = "aspect-[4/3]",
  widthClass = "w-full",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  aspect?: string;
  widthClass?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative flex ${aspect} ${widthClass} flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gold/50 bg-gradient-to-br from-gold/10 via-accent to-primary/10 p-4 text-center ${className}`}
      role="img"
      aria-label={`${label} — placeholder image`}
    >
      <span className="rounded-full border border-gold/50 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
        Placeholder
      </span>
      <span className="mt-3 text-sm font-semibold text-text-primary">
        {label}
      </span>
      {hint && <span className="mt-1 text-xs text-text-muted">{hint}</span>}
      {children}
    </div>
  );
}
