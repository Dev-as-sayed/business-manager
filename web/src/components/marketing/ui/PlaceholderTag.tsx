import { cn } from "@/lib/utils";

export function PlaceholderTag({
  label = "Placeholder",
  tone = "default",
  className,
}: {
  label?: string;
  tone?: "default" | "inverse" | "lime";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.14em]",
        tone === "inverse" && "border-white/15 bg-white/5 text-white/65",
        tone === "lime" && "border-lime-contrast/15 bg-lime text-lime-contrast",
        tone === "default" && "border-line bg-surface-2 text-ink-muted",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1 w-1 rounded-full",
          tone === "inverse" ? "bg-lime" : "bg-lime-strong",
        )}
      />
      {label}
    </span>
  );
}
