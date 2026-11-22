import Link from "next/link";
import { FiArrowUpRight, FiCheck } from "react-icons/fi";
import { ServiceIcon } from "./ServiceIcon";
import type { Service } from "@/content/services";
import { cn } from "@/lib/utils";

export function ServiceCard({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-lift",
        service.cardClass,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-7 font-display text-[6.5rem] font-semibold leading-none tracking-[-0.08em] text-ink/[0.045]"
      >
        {service.index}
      </span>

      <div className="relative flex items-center justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-soft text-ink">
          <ServiceIcon service={service.id} />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          {service.index} / 05
        </span>
      </div>

      <h3 className="relative mt-5 font-display text-xl font-semibold tracking-[-0.025em] text-ink">
        {service.name}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">
        {service.tagline}
      </p>

      <ul className="relative mt-5 space-y-2.5">
        {service.bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex items-start gap-2.5 text-sm text-ink-muted"
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-soft text-ink">
              <FiCheck aria-hidden="true" className="h-2.5 w-2.5" />
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      <Link
        href={`/services#${service.id}`}
        className="relative mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
      >
        Learn more
        <FiArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </Link>

      <span
        aria-hidden="true"
        className="absolute inset-x-6 bottom-0 h-0.5 origin-left scale-x-0 bg-lime transition-transform duration-300 group-hover:scale-x-100"
      />
    </article>
  );
}
