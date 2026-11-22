"use client";

import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import { primaryCta, secondaryCta } from "@/lib/marketing-content";

export default function ServicesCTA() {
  return (
    <section className="px-4 pb-20 pt-4 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-launcher-ink px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <h2 className="relative text-3xl font-bold sm:text-4xl lg:text-5xl">
            Not Sure Where to Start?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">
            Tell us your idea. We will recommend the shortest path to launch.
          </p>

          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={primaryCta.href} variant="gold" size="lg" arrow>
              {primaryCta.label}
            </Button>
            <Button
              href={secondaryCta.href}
              variant="dark"
              size="lg"
              className="border border-white/20"
            >
              {secondaryCta.label}
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
