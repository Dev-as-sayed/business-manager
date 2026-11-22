import { cn } from "@/lib/utils";

export function StepTimeline({
  steps,
  className,
}: {
  steps: { title: string; you: string; we: string }[];
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden="true"
        className="absolute bottom-5 left-5 top-5 w-px bg-line lg:hidden"
      />
      <span
        aria-hidden="true"
        className="absolute left-0 right-0 top-5 hidden h-px bg-line lg:block"
      />
      <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4 lg:flex-col">
            <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime font-mono text-xs font-semibold text-lime-contrast">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 lg:mt-5">
              <h3 className="text-base font-semibold leading-snug text-ink">
                {step.title}
              </h3>
              <dl className="mt-3 space-y-2.5">
                <div>
                  <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-lime-ink">
                    You do
                  </dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                    {step.you}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
                    We do
                  </dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                    {step.we}
                  </dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
