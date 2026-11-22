"use client";

import { FiCheckCircle } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import ServiceTabs from "@/components/marketing/services/ServiceTabs";
import {
  primaryCta,
  secondaryCta,
} from "@/lib/marketing-content";
import { servicesPageContent } from "@/lib/marketing-pages";

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 lg:pt-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-gold" />
            {servicesPageContent.hero.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            {servicesPageContent.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">
            {servicesPageContent.hero.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={primaryCta.href} size="lg" arrow>
              {primaryCta.label}
            </Button>
            <Button href={secondaryCta.href} variant="secondary" size="lg">
              {secondaryCta.label}
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {["Five connected services", "One team", "One timeline"].map(
              (item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-text-secondary"
                >
                  <FiCheckCircle
                    className="h-4 w-4 text-action"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <ServiceTabs />
    </section>
  );
}
