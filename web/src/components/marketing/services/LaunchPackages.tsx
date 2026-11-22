"use client";

import { FiCheck } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { servicesPageContent } from "@/lib/marketing-pages";

export default function LaunchPackages() {
  return (
    <section className="border-y border-border bg-secondary-background/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Launch packages"
            title="Launch Packages, Built Around Your Goal"
            description="Pick a starting point. We will tailor the scope and send a custom quote."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {servicesPageContent.launchPackages.map((pkg, index) => (
            <Reveal key={pkg.name} delay={index * 0.08}>
              <article
                className={`flex h-full flex-col rounded-2xl border p-6 shadow-soft ${
                  pkg.featured
                    ? "border-primary bg-gradient-to-b from-primary/5 to-card shadow-card"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {pkg.name}
                  </h3>
                  {pkg.featured && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                      Most popular
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-text-secondary">
                  {pkg.description}
                </p>
                <div className="mt-5">
                  <span className="text-2xl font-bold text-text-primary">
                    Custom quote
                  </span>
                  <p className="mt-1 text-xs text-text-muted">
                    Tailored to your scope
                  </p>
                </div>
                <ul className="mt-5 flex-1 space-y-2">
                  {pkg.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <FiCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-action"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  href="/contact?intent=quote"
                  variant={pkg.featured ? "primary" : "secondary"}
                  className="mt-6 w-full"
                >
                  Get My Custom Quote
                </Button>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-text-muted">
          Package names and inclusions are placeholders. Final scope and pricing
          are quoted per project.
        </p>
      </div>
    </section>
  );
}
