"use client";

import Link from "next/link";
import { FiArrowRight, FiCheck, FiDollarSign, FiPackage } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { pricingTiers } from "@/lib/marketing-content";

export default function PricingTeaser() {
  return (
    <section id="pricing" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Transparent Pricing, No Hidden Markups"
            description="Two costs, explained clearly: a service package for the work, and product/shipping billed per order at cost with a full breakdown."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Reveal>
            <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FiDollarSign className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  1. Service & platform packages
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  A clear one-time package for sourcing, development, store
                  setup, content, or marketing.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <FiPackage className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  2. Product & shipping, at cost
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Billed per order with a transparent breakdown — no hidden
                  markup buried in the price.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.08}>
              <article
                className={`flex h-full flex-col rounded-2xl border p-6 shadow-soft ${
                  tier.featured
                    ? "border-primary bg-gradient-to-b from-primary/5 to-card shadow-card"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {tier.name}
                  </h3>
                  {tier.featured && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-bold text-text-primary">
                    {tier.price}
                  </span>
                  <span className="pb-1 text-xs text-text-muted">
                    {tier.priceNote}
                  </span>
                </div>
                <p className="mt-3 text-sm text-text-secondary">
                  {tier.description}
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <FiCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-action"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  href="/contact?intent=quote"
                  variant={tier.featured ? "primary" : "secondary"}
                  className="mt-6 w-full"
                >
                  Get My Custom Quote
                </Button>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 text-center">
          <Link
            href="/contact?intent=pricing"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            See full pricing
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-3 text-[11px] text-text-muted">
            Package names and inclusions are placeholders. Final scope and
            pricing are quoted per project.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
