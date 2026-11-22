"use client";

import { useState } from "react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { FiCheckCircle, FiSmartphone } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Icon from "@/components/marketing/Icon";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { appLinks, primaryCta, softwareTabs } from "@/lib/marketing-content";

export default function SoftwarePreview() {
  const [activeId, setActiveId] = useState(softwareTabs[0].id);
  const active = softwareTabs.find((tab) => tab.id === activeId) ?? softwareTabs[0];

  return (
    <section className="border-y border-border bg-secondary-background/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="The software"
            title="Sell and Manage Everything From One Dashboard"
            description="Your storefront, orders, inventory, customers, and analytics are connected — on desktop and on your phone."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mt-8 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label="Software features"
          >
            {softwareTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={tab.id === activeId}
                onClick={() => setActiveId(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  tab.id === activeId
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-background text-text-secondary hover:bg-accent"
                }`}
              >
                <Icon name={tab.icon} className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div
          className="mt-10 grid items-center gap-8 lg:grid-cols-5"
          role="tabpanel"
          id={`panel-${active.id}`}
          aria-labelledby={`tab-${active.id}`}
        >
          <Reveal className="lg:col-span-3">
            <div className="rounded-3xl border border-border bg-card p-3 shadow-card">
              <div className="rounded-2xl bg-launcher-ink p-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                  <span className="h-2.5 w-2.5 rounded-full bg-action" />
                  <span className="ml-3 flex-1 rounded-md bg-white/10 px-3 py-1 text-[10px] text-white/50">
                    app.thebrandlauncher.com
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Revenue", value: "$8.4k" },
                    { label: "Orders", value: "126" },
                    { label: "Customers", value: "89" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-white/40">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {active.title}
                      </p>
                      <p className="mt-1 text-xs text-white/50">
                        {active.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-gold/20 px-2 py-1 text-[10px] font-semibold text-gold">
                      Live
                    </span>
                  </div>
                  <div className="mt-4 flex h-20 items-end gap-1.5">
                    {[35, 55, 42, 70, 62, 85, 78, 92, 68, 88].map(
                      (height, index) => (
                        <span
                          key={index}
                          className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-gold"
                          style={{ height: `${height}%` }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
              <div className="mx-auto mt-2 h-2.5 w-1/2 rounded-b-xl bg-border" />
            </div>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-2">
            <div className="flex flex-col items-center gap-6">
              <div className="w-44 rounded-[2rem] border-4 border-launcher-ink bg-launcher-ink p-2 shadow-card">
                <div className="rounded-[1.5rem] bg-background p-3">
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-launcher-ink/20" />
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FiSmartphone className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[10px] text-text-muted">Today</p>
                      <p className="text-xs font-semibold text-text-primary">
                        $1,284
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {["New order", "Low stock", "New customer"].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 rounded-lg bg-accent px-2 py-1.5"
                      >
                        <FiCheckCircle className="h-3 w-3 text-action" aria-hidden="true" />
                        <span className="text-[10px] text-text-secondary">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href={appLinks.appStore}
                  className="inline-flex items-center gap-2 rounded-xl bg-launcher-ink px-4 py-2 text-white transition hover:bg-launcher-ink-soft"
                  aria-label="Download on the App Store (placeholder link)"
                >
                  <FaApple className="h-5 w-5" />
                  <span className="text-left leading-tight">
                    <span className="block text-[9px] text-white/60">
                      Download on the
                    </span>
                    <span className="block text-xs font-semibold">App Store</span>
                  </span>
                </a>
                <a
                  href={appLinks.googlePlay}
                  className="inline-flex items-center gap-2 rounded-xl bg-launcher-ink px-4 py-2 text-white transition hover:bg-launcher-ink-soft"
                  aria-label="Get it on Google Play (placeholder link)"
                >
                  <FaGooglePlay className="h-5 w-5" />
                  <span className="text-left leading-tight">
                    <span className="block text-[9px] text-white/60">
                      Get it on
                    </span>
                    <span className="block text-xs font-semibold">Google Play</span>
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
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
