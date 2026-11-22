"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiCpu,
  FiLayers,
  FiSearch,
  FiSmartphone,
  FiTruck,
} from "react-icons/fi";
import Reveal from "@/components/Public/Reveal";

const services = [
  {
    icon: FiCpu,
    title: "AI Website Builder",
    description:
      "Describe your business idea and get a tailored website — structure, design, and copy included. Refine it in a visual editor and publish to a secure subdomain in one click.",
    points: [
      "Prompt-to-website generation",
      "Drag-and-drop visual editor",
      "Instant subdomain publishing",
    ],
  },
  {
    icon: FiSearch,
    title: "Product Sourcing From China",
    description:
      "Access vetted suppliers and high-margin products through our on-the-ground network in China. We negotiate, verify, and consolidate so you get reliable quality.",
    points: [
      "Vetted supplier network",
      "Quality checks before shipping",
      "Competitive, high-margin pricing",
    ],
  },
  {
    icon: FiTruck,
    title: "Door-to-Door Logistics",
    description:
      "From the factory floor to your customer's door. We coordinate freight, customs, and last-mile delivery so you never have to manage shipping agents.",
    points: [
      "End-to-end freight coordination",
      "Customs and documentation",
      "Last-mile delivery tracking",
    ],
  },
  {
    icon: FiSmartphone,
    title: "Business CRM & Management",
    description:
      "Run sales, leads, orders, and operations from one dashboard. Public website forms and checkouts sync straight into the CRM so nothing gets lost.",
    points: [
      "Real-time sales dashboard",
      "Kanban lead and deal pipelines",
      "Automated website-to-CRM syncing",
    ],
  },
  {
    icon: FiBarChart2,
    title: "Content, SEO & Marketing",
    description:
      "Launch with content that ranks and converts. We set up SEO foundations, product copy, and marketing assets that fit your brand from day one.",
    points: [
      "SEO-ready site structure",
      "Product and brand copy",
      "Campaign-ready marketing assets",
    ],
  },
  {
    icon: FiLayers,
    title: "Backend & Infrastructure",
    description:
      "A scalable, type-safe backend on Express, PostgreSQL, and Prisma with multi-tenant isolation and an AI automation bridge for orders and leads.",
    points: [
      "Secure multi-tenant API",
      "Type-safe PostgreSQL + Prisma",
      "AI and webhook automation",
    ],
  },
];

const steps = [
  {
    title: "Share your idea",
    description: "Tell us what you want to launch and who you want to sell to.",
  },
  {
    title: "AI builds your site",
    description: "Get a complete, editable website generated in minutes.",
  },
  {
    title: "We source & ship",
    description: "We match suppliers and handle door-to-door delivery.",
  },
  {
    title: "You launch & grow",
    description: "Track sales, leads, and shipments in your integrated CRM.",
  },
];

export default function ServicesContent() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-24">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Services
            </span>
            <h1 className="mt-3 text-4xl font-bold text-text-primary sm:text-5xl">
              One Ecosystem. Every Step of the Launch.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary">
              From the first prompt to the final delivery, The Brand Launcher
              covers the technology, the supply chain, and the operations.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={(index % 3) * 0.1}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <service.icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-xl font-semibold text-text-primary">
                    {service.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
                    {service.description}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {service.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <FiCheckCircle className="h-4 w-4 shrink-0 text-action" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-border bg-secondary-background/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              How it works
            </span>
            <h2 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">
              From Idea to Live Brand in Four Steps
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.1}>
                <div className="relative h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span className="text-3xl font-bold text-primary/20">
                    0{index + 1}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-6 py-14 text-center text-primary-foreground sm:px-12">
              <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <h2 className="relative text-3xl font-bold sm:text-4xl">
                Not Sure Where to Start?
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/90">
                Tell us about your idea and we&apos;ll map the fastest path to
                launch.
              </p>
              <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary shadow-lg transition hover:bg-primary-foreground/90"
                >
                  Book a Conversation
                  <FiArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  About Us
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
