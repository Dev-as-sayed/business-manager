"use client";

import { FiCheck, FiGlobe, FiTruck } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import StatCounter from "@/components/marketing/StatCounter";
import { chinaHighlights, chinaStats, secondaryCta } from "@/lib/marketing-content";

export default function ChinaBridgeBand() {
  return (
    <section className="bg-launcher-ink py-20 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-gold">
                The China Bridge
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                Our Team on the Ground in China
              </h2>
              <p className="mt-4 max-w-xl text-white/70">
                We are not a middleman reselling from a catalog. We verify
                factories, inspect quality, negotiate prices, and ship
                door-to-door — so you get factory-direct economics with real
                accountability.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {chinaHighlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-white/80"
                  >
                    <FiCheck className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                href={secondaryCta.href}
                variant="gold"
                size="lg"
                className="mt-8"
                arrow
              >
                {secondaryCta.label}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                      <FiGlobe className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <p className="mt-2 text-sm font-semibold">China</p>
                    <p className="text-xs text-white/50">Factory floor</p>
                  </div>

                  <div className="relative flex-1">
                    <div className="h-px w-full border-t border-dashed border-gold/60" />
                    <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-gold px-2 py-1 text-[10px] font-bold text-gold-foreground">
                      <FiTruck className="h-3 w-3" aria-hidden="true" />
                      Door-to-door
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-gold-foreground">
                      <FiTruck className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <p className="mt-2 text-sm font-semibold">Your door</p>
                    <p className="text-xs text-white/50">Anywhere</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                {chinaStats.map((stat) => (
                  <StatCounter
                    key={stat.label}
                    value={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                  />
                ))}
              </div>
              <p className="text-center text-[11px] text-white/40">
                Figures are conservative placeholders — replace with verified
                numbers before launch.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
