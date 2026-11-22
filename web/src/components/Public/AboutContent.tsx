"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiCheckCircle,
  FiGlobe,
  FiLayers,
  FiZap,
} from "react-icons/fi";
import { FaRocket } from "react-icons/fa";
import Reveal from "@/components/Public/Reveal";

const values = [
  {
    icon: FiZap,
    title: "Speed",
    description:
      "We compress months of setup into minutes with AI and ready-made components.",
  },
  {
    icon: FiLayers,
    title: "One Roof",
    description:
      "Website, sourcing, logistics, and CRM work together — no disconnected tools.",
  },
  {
    icon: FiGlobe,
    title: "Global Reach",
    description:
      "Direct China sourcing and door-to-door delivery to customers anywhere.",
  },
  {
    icon: FaRocket,
    title: "Zero Friction",
    description:
      "You bring the idea. We handle the technical and operational heavy lifting.",
  },
];

const milestones = [
  "You share your business idea",
  "AI generates your website, structure, and copy",
  "We match you with vetted China suppliers",
  "Products ship door-to-door to your customers",
  "Your CRM tracks every sale, lead, and shipment",
];

export default function AboutContent() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-24">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              About us
            </span>
            <h1 className="mt-3 text-4xl font-bold text-text-primary sm:text-5xl">
              We Build the Bridge From Idea to Brand
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary">
              The Brand Launcher exists so that anyone — regardless of technical
              skill or supply chain connections — can launch a product-based
              brand with confidence.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                Our mission
              </span>
              <h2 className="mt-3 text-3xl font-bold text-text-primary">
                Remove Every Barrier Between You and Your First Sale
              </h2>
              <p className="mt-4 leading-relaxed text-text-secondary">
                Launching a brand used to mean hiring web developers, finding
                Chinese suppliers, booking shipping agents, and learning digital
                marketing — all separately. We believed that friction was
                unnecessary.
              </p>
              <p className="mt-4 leading-relaxed text-text-secondary">
                So we built a single ecosystem that combines an AI website
                builder, direct product sourcing, door-to-door logistics, and a
                powerful CRM. The result is a true zero-to-launch experience.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-text-primary">
                How a launch works
              </h3>
              <ul className="mt-5 space-y-4">
                {milestones.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-text-secondary">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-secondary-background/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              What we stand for
            </span>
            <h2 className="mt-3 text-3xl font-bold text-text-primary sm:text-4xl">
              Values That Drive Every Launch
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 0.1}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <value.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <div className="rounded-3xl border border-border bg-card p-8 shadow-soft sm:p-12">
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
                Our Promise
              </h2>
              <p className="mt-4 leading-relaxed text-text-secondary">
                We are not a generic website builder. We are an operator with a
                real presence and network in China, combining that advantage with
                software that makes the entire journey effortless. You get
                high-margin products, reliable delivery, and a brand that is ready
                to sell — without the operational chaos.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Turnkey, not DIY",
                  "High-margin sourcing",
                  "Door-to-door delivery",
                  "One integrated CRM",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-text-secondary"
                  >
                    <FiCheckCircle className="h-4 w-4 shrink-0 text-action" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover"
              >
                Talk to Us
                <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
