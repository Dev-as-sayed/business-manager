import { FiMinus, FiPlus } from "react-icons/fi";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/content/faqs";

export function FAQAccordion({
  items,
  tone = "default",
  className,
}: {
  items: FaqItem[];
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y overflow-hidden rounded-2xl border",
        tone === "inverse"
          ? "divide-white/10 border-white/10 bg-white/[0.03]"
          : "divide-line border-line bg-surface",
        className,
      )}
    >
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-left transition-colors sm:px-6",
              tone === "inverse"
                ? "text-white hover:bg-white/[0.04]"
                : "text-ink hover:bg-surface-2/60 group-open:bg-surface-2/50",
            )}
          >
            <span className="text-base font-semibold leading-snug text-pretty">
              {item.question}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                tone === "inverse"
                  ? "border-white/20 text-lime"
                  : "border-line text-ink group-open:border-lime group-open:bg-lime group-open:text-lime-contrast",
              )}
            >
              <FiPlus className="h-4 w-4 group-open:hidden" />
              <FiMinus className="hidden h-4 w-4 group-open:block" />
            </span>
          </summary>
          <div
            className={cn(
              "px-5 pb-5 text-sm leading-[1.65] text-pretty sm:px-6 sm:pb-6",
              tone === "inverse" ? "text-band-muted" : "text-ink-muted",
            )}
          >
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
