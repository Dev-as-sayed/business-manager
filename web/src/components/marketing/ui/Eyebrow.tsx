import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "inverse" | "onLime";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]",
        tone === "inverse" && "text-band-muted",
        tone === "default" && "text-ink-muted",
        tone === "onLime" && "text-lime-contrast/75",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 shrink-0 rounded-[2px]",
          tone === "onLime" ? "bg-lime-contrast" : "bg-lime",
        )}
      />
      {children}
    </span>
  );
}
