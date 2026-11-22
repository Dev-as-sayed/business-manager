import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  tone = "default",
  className,
  wordmarkClassName,
  href = "/",
}: {
  tone?: "default" | "inverse";
  className?: string;
  wordmarkClassName?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Omnia home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 40 40"
        className="h-9 w-9 shrink-0"
        fill="none"
      >
        <rect width="40" height="40" rx="12" fill="var(--band)" />
        <circle
          cx="20"
          cy="20"
          r="9.5"
          stroke="var(--lime)"
          strokeWidth="2"
        />
        <path
          d="M20 5.5A14.5 14.5 0 0 1 34.5 20"
          stroke="var(--lime)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="34.5" cy="20" r="2.6" fill="var(--lime)" />
      </svg>
      <span
        className={cn(
          "font-display text-[1.35rem] font-semibold leading-none tracking-[-0.045em]",
          tone === "inverse" ? "text-white" : "text-ink",
          wordmarkClassName,
        )}
      >
        omnia
      </span>
      <span
        aria-hidden="true"
        className="mb-0.5 inline-block h-1.5 w-1.5 self-end rounded-full bg-lime"
      />
    </Link>
  );
}
