"use client";

import { FiCheckCircle } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import PlaceholderImage from "@/components/marketing/PlaceholderImage";
import { primaryCta } from "@/lib/marketing-content";
import { aboutContent } from "@/lib/marketing-pages";

export default function AboutHero() {
  const { hero } = aboutContent;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-gold" />
            {hero.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            {hero.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={primaryCta.href} size="lg" arrow>
              {primaryCta.label}
            </Button>
            <Button
              href="/contact?intent=consultation"
              variant="secondary"
              size="lg"
            >
              Book a Free Consultation
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {hero.trust.map((item) => (
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
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <PlaceholderImage
            label={hero.images[0].label}
            hint={hero.images[0].hint}
            aspect="aspect-[4/5]"
            className="shadow-card"
          />
          <div className="absolute -bottom-6 -left-6 w-40 sm:w-48">
            <PlaceholderImage
              label={hero.images[1].label}
              hint={hero.images[1].hint}
              aspect="aspect-square"
              className="shadow-card"
            />
          </div>
          <div className="absolute -right-3 top-6 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gold">
              One team
            </p>
            <p className="text-sm font-semibold text-text-primary">
              China → your door
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
