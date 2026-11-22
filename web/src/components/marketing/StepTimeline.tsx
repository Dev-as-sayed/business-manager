"use client";

import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import Button from "@/components/marketing/Button";
import { primaryCta, steps } from "@/lib/marketing-content";

export default function StepTimeline() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-border bg-secondary-background/60 py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="A Clear Path From Idea to First Sale"
            description="You always know what you do and what we handle. No black boxes, no surprise handoffs."
          />
        </Reveal>

        <div className="relative mt-12">
          <div
            aria-hidden="true"
            className="absolute left-5 top-0 hidden h-px w-full bg-border md:left-0 md:top-5 md:block"
          />
          <ol className="grid gap-6 md:grid-cols-5">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.08}>
                <li className="relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                        You
                      </span>
                      <p className="mt-1 text-text-secondary">{step.you}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                        We
                      </span>
                      <p className="mt-1 text-text-secondary">{step.we}</p>
                    </div>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="mt-10 text-center">
          <Button href={primaryCta.href} size="lg" arrow>
            {primaryCta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
