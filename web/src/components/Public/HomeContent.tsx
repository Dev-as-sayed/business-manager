"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiBox,
  FiCheckCircle,
  FiCpu,
  FiGlobe,
  FiLayers,
  FiSmartphone,
  FiZap,
} from "react-icons/fi";
import { FaRocket } from "react-icons/fa";
import Reveal from "@/components/Public/Reveal";

const pillars = [
  {
    icon: FiCpu,
    title: "AI Website Builder",
    description:
      "Go from a prompt to a live, professional website. AI generates the structure, design, and copy — you fine-tune it in a visual editor and publish instantly.",
    points: ["Prompt-to-website", "Visual editor", "One-click publishing"],
  },
  {
    icon: FiSmartphone,
    title: "Cross-Platform CRM",
    description:
      "Run your business from anywhere. Track sales and leads on the go, manage deals on Kanban pipelines, and sync every inquiry and checkout automatically.",
    points: ["Real-time dashboard", "Lead & deal pipelines", "Automated syncing"],
  },
  {
    icon: FiLayers,
    title: "Backend & Infrastructure",
    description:
      "A type-safe, multi-tenant foundation built on Express, PostgreSQL, and Prisma — with an AI and automation bridge for instant order and lead processing.",
    points: ["Scalable API engine", "PostgreSQL + Prisma", "AI automation bridge"],
  },
];

const advantages = [
  {
    icon: FiGlobe,
    title: "The China Bridge",
    description:
      "Direct product sourcing and reliable door-to-door logistics from China — high-margin products and shipping that local agencies cannot easily replicate.",
  },
  {
    icon: FiZap,
    title: "Speed-to-Market",
    description:
      "AI generation combined with ready-made components cuts brand launch time from weeks down to minutes, not months.",
  },
];

const audience = [
  {
    title: "Aspiring Entrepreneurs",
    description:
      "You have a business idea but not the technical skills or supply chain connections. We handle both so you can focus on the brand.",
  },
  {
    title: "Small Business Owners",
    description:
      "Digitize your operations, move online, and scale globally with one platform instead of a stack of disconnected tools.",
  },
];

const stats = [
  { value: "Minutes", label: "From idea to live site" },
  { value: "1", label: "Unified platform" },
  { value: "End-to-end", label: "Sourcing to delivery" },
];

export default function HomeContent() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <FaRocket className="h-4 w-4" />
              Zero-to-Launch Ecosystem
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-4xl font-bold leading-tight text-text-primary sm:text-5xl lg:text-6xl"
            >
              Launch Your Brand From{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Zero to Market
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary"
            >
              The Brand Launcher turns your business idea into a live brand with
              an AI-built website, direct China sourcing, door-to-door logistics,
              and an integrated CRM — all under one roof.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg transition hover:bg-primary-hover"
              >
                Start Your Launch
                <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-semibold text-text-primary transition hover:bg-accent"
              >
                Explore Services
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 grid max-w-lg grid-cols-3 gap-4"
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-bold text-text-primary sm:text-2xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-text-muted sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-danger" />
                <span className="h-3 w-3 rounded-full bg-warning" />
                <span className="h-3 w-3 rounded-full bg-action" />
                <span className="flex-1 text-center text-sm font-medium text-text-secondary">
                  Launch Dashboard
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Sales", value: "$12.4k" },
                  { label: "Leads", value: "48" },
                  { label: "Orders", value: "126" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-accent p-3 text-center">
                    <div className="text-lg font-bold text-text-primary">{item.value}</div>
                    <div className="text-xs text-text-muted">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-accent p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-text-secondary">
                  <span>Launch progress</span>
                  <span className="font-semibold text-action">82%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "82%" }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-action"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {["Website generated", "Supplier matched", "Shipment booked"].map(
                  (step, index) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.15 }}
                      className="flex items-center gap-3 text-sm text-text-secondary"
                    >
                      <FiCheckCircle className="h-4 w-4 text-action" />
                      {step}
                    </motion.div>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-border bg-secondary-background/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              What you get
            </span>
            <h2 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">
              Everything You Need to Launch
            </h2>
            <p className="mt-4 text-text-secondary">
              Instead of juggling developers, suppliers, shipping agents, and
              marketers, you get one turnkey ecosystem.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.1}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <pillar.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-text-primary">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {pillar.description}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {pillar.points.map((point) => (
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

      {/* Advantages */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Why us
            </span>
            <h2 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">
              A Strategic Advantage You Can&apos;t Copy
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {advantages.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.1}>
                <div className="flex h-full gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                    <item.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="border-t border-border bg-secondary-background/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Who it&apos;s for
            </span>
            <h2 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">
              Built for Founders, Not Developers
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {audience.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.1}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-action/10 text-action">
                    <FiBox className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {item.description}
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
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <h2 className="relative text-3xl font-bold sm:text-4xl">
                Ready to Launch Your Brand?
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/90">
                Tell us your idea and we&apos;ll help you go from zero to a live,
                revenue-ready brand — fast.
              </p>
              <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary shadow-lg transition hover:bg-primary-foreground/90"
                >
                  <FaRocket className="h-4 w-4" />
                  Start Your Launch
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
