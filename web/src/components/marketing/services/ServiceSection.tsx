"use client";

import { FiCheck, FiUsers } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Icon from "@/components/marketing/Icon";
import Reveal from "@/components/marketing/Reveal";
import ServiceVisual from "@/components/marketing/services/ServiceVisual";
import type { servicesPageContent } from "@/lib/marketing-pages";

type Service = (typeof servicesPageContent.services)[number];

export default function ServiceSection({
  service,
  index,
}: {
  service: Service;
  index: number;
}) {
  const reversed = index % 2 === 1;

  return (
    <section
      id={service.slug}
      className="scroll-mt-32 border-b border-border py-16 lg:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal className={reversed ? "lg:order-2" : ""}>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-gold">
              Service {String(index + 1).padStart(2, "0")}
            </span>
            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name={service.icon} className="h-5 w-5" />
              </span>
              <h2 className="text-3xl font-bold leading-tight text-text-primary sm:text-4xl">
                {service.headline}
              </h2>
            </div>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              {service.description}
            </p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-primary">
                What&apos;s included
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {service.includes.map((item) => (
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
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-text-primary">
                How it works
              </h3>
              <ol className="mt-3 space-y-2">
                {service.steps.map((step, stepIndex) => (
                  <li
                    key={step}
                    className="flex items-center gap-3 text-sm text-text-secondary"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[11px] font-bold text-gold">
                      {stepIndex + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-secondary-background/60 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FiUsers className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  Who it&apos;s for
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {service.whoFor}
                </p>
              </div>
            </div>

            <Button href={service.cta.href} className="mt-6" size="lg" arrow>
              {service.cta.label}
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1} className={reversed ? "lg:order-1" : ""}>
          <ServiceVisual variant={service.visual} />
        </Reveal>
      </div>
    </section>
  );
}
