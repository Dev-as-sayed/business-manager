"use client";

import { FiCheckCircle } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { primaryCta } from "@/lib/marketing-content";
import { aboutContent } from "@/lib/marketing-pages";

export default function PromiseSection() {
  return (
    <section className="border-y border-border bg-secondary-background/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Our promise"
            title="What You Can Expect From Us"
            description="Clear communication, quality checks, and no surprises between you and the factory."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {aboutContent.promises.map((promise, index) => (
            <Reveal key={promise.title} delay={index * 0.06}>
              <article className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft">
                <FiCheckCircle
                  className="h-6 w-6 text-action"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-sm font-semibold text-text-primary">
                  {promise.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {promise.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button href={primaryCta.href} arrow>
            {primaryCta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
