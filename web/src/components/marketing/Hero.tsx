"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  FiCamera,
  FiCheckCircle,
  FiMonitor,
  FiPackage,
  FiTool,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import Button from "@/components/marketing/Button";
import {
  primaryCta,
  secondaryCta,
  trustPoints,
} from "@/lib/marketing-content";

const flow = [
  { label: "Idea", icon: FiZap, detail: "You share the vision" },
  { label: "Factory", icon: FiTool, detail: "We source or develop" },
  { label: "Product", icon: FiPackage, detail: "Samples and QC" },
  { label: "Website", icon: FiMonitor, detail: "Your store goes live" },
  { label: "Content", icon: FiCamera, detail: "Photos, video, ads" },
  { label: "Customer", icon: FiUsers, detail: "Orders and growth" },
];

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-gold" />
            China sourcing · Product development · Growth
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] text-text-primary sm:text-5xl lg:text-6xl">
            From Product Idea to{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-gold bg-clip-text text-transparent">
              Profitable Brand.
            </span>{" "}
            All in One Place.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            We source or create your product in China, build your online store,
            produce your content, and market it. You focus on your brand.
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
            {trustPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 text-sm font-medium text-text-secondary"
              >
                <FiCheckCircle className="h-4 w-4 text-action" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, x: 32 }}
          animate={reduce ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                  Your launch pipeline
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  Idea to first customer
                </p>
              </div>
              <span className="rounded-full bg-action/10 px-3 py-1 text-xs font-semibold text-action">
                One team
              </span>
            </div>

            <ol className="mt-4 space-y-1">
              {flow.map((step, index) => (
                <li
                  key={step.label}
                  className="relative flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-accent"
                >
                  {index < flow.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[26px] top-[42px] h-[18px] w-px bg-border"
                    />
                  )}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      index === flow.length - 1
                        ? "bg-gold text-gold-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-text-primary">
                      {step.label}
                    </span>
                    <span className="block text-xs text-text-muted">
                      {step.detail}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold text-text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-launcher-ink px-4 py-3 text-white">
              <span className="text-xs font-medium text-white/70">
                Door-to-door shipping
              </span>
              <span className="text-xs font-semibold text-gold">
                Included end-to-end
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
