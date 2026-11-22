"use client";

import Link from "next/link";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import Icon from "@/components/marketing/Icon";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import Button from "@/components/marketing/Button";
import { primaryCta, services } from "@/lib/marketing-content";

export default function ServicePillars() {
  return (
    <section id="services" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="What we do"
            title="Five Connected Services. One Launch."
            description="Pick the help you need or hand us the whole launch. Every service is built to work with the others, so nothing gets lost between vendors."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-6">
          {services.map((service, index) => (
            <Reveal
              key={service.id}
              delay={(index % 3) * 0.08}
              className={service.featured ? "lg:col-span-3" : "lg:col-span-2"}
            >
              <article
                id={`service-${service.id}`}
                className={`flex h-full flex-col rounded-2xl border p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card ${
                  service.featured
                    ? "border-primary/25 bg-gradient-to-br from-primary/5 via-card to-gold/5"
                    : "border-border bg-card"
                }`}
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={service.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-text-primary">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-primary">
                  {service.benefit}
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {service.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <FiCheck
                        className="mt-0.5 h-4 w-4 shrink-0 text-action"
                        aria-hidden="true"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  href={service.href}
                  className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  Learn more
                  <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button href={primaryCta.href} size="lg" arrow>
            {primaryCta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
