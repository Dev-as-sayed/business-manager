"use client";

import { FiArrowRight, FiCheck } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import PlaceholderImage from "@/components/marketing/PlaceholderImage";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { devSteps } from "@/lib/marketing-content";

export default function ProductDevSpotlight() {
  return (
    <section className="py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div>
            <SectionHeading
              align="left"
              eyebrow="Custom product development"
              title="From a Napkin Sketch to a Shelf-Ready Product"
              description="Have an idea but no factory? Our partners handle design, tooling, prototypes, samples, packaging, and mass production — with your approval at every stage."
            />
            <ul className="mt-6 space-y-3">
              {[
                "Design and 3D modeling",
                "Prototype and sample rounds",
                "Branding, packaging, and mass production",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm font-medium text-text-secondary"
                >
                  <FiCheck className="h-4 w-4 text-action" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              href="/contact?intent=product"
              className="mt-8"
              size="lg"
              arrow
            >
              Turn My Idea Into a Product
            </Button>
            <p className="mt-3 text-xs text-text-muted">
              No technical drawings required — a sketch or reference is enough
              to start.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <p className="text-sm font-semibold text-text-primary">
                Development journey
              </p>
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                6 stages
              </span>
            </div>
            <ol className="mt-4 space-y-3">
              {devSteps.map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <PlaceholderImage
                    label={step}
                    aspect="aspect-[16/10]"
                    widthClass="w-24"
                    className="h-16 shrink-0 rounded-lg p-1"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">
                      {step}
                    </p>
                    <p className="text-xs text-text-muted">
                      {index === 0 && "Share a sketch or reference"}
                      {index === 1 && "We turn it into a 3D design"}
                      {index === 2 && "A physical prototype is built"}
                      {index === 3 && "You approve the final sample"}
                      {index === 4 && "Factory production begins"}
                      {index === 5 && "Branded packaging and prep"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-xs text-text-secondary">
              <FiArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
              You approve every stage before we move forward.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
