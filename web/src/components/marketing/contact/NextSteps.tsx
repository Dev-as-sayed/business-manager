"use client";

import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { contactPageContent } from "@/lib/marketing-pages";

export default function NextSteps() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="What happens next"
            title="From Message to Launch in Three Steps"
            description="No black box. You know exactly what happens after you hit send."
          />
        </Reveal>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {contactPageContent.nextSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <li className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
