"use client";

import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { primaryCta } from "@/lib/marketing-content";
import { servicesPageContent } from "@/lib/marketing-pages";

export default function JourneyTimeline() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="The full journey"
            title="From Idea to First Delivered Order"
            description="Every service connects to the next, so nothing gets lost between vendors."
          />
        </Reveal>

        <div className="relative mt-12">
          <div
            aria-hidden="true"
            className="absolute left-5 top-0 h-full w-px bg-border lg:left-0 lg:top-5 lg:h-px lg:w-full"
          />
          <ol className="grid gap-6 lg:grid-cols-6">
            {servicesPageContent.journeySteps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.06}>
                <li className="relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="mt-3 inline-flex w-fit rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                    {step.service}
                  </span>
                  <h3 className="mt-2 text-sm font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
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
