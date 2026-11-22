"use client";

import Button from "@/components/marketing/Button";
import Icon from "@/components/marketing/Icon";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { primaryCta } from "@/lib/marketing-content";
import { aboutContent } from "@/lib/marketing-pages";

export default function MissionVisionValues() {
  const { missionVision, values } = aboutContent;

  return (
    <section className="border-y border-border bg-secondary-background/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Mission, vision & values"
            title="Why We Exist"
            description="A launch should not depend on who you already know. We built the team we wished existed when we started."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-gold/10 p-8 shadow-card">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                Our mission
              </span>
              <p className="mt-4 text-2xl font-semibold leading-snug text-text-primary sm:text-3xl">
                {missionVision.mission}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/10 via-card to-primary/5 p-8 shadow-card">
              <span className="text-xs font-semibold uppercase tracking-wide text-gold">
                Our vision
              </span>
              <p className="mt-4 text-2xl font-semibold leading-snug text-text-primary sm:text-3xl">
                {missionVision.vision}
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.06}>
              <article className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={value.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-text-primary">
                  {value.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {value.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button href={primaryCta.href} variant="secondary" arrow>
            {primaryCta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
