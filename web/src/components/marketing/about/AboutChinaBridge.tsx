"use client";

import { FiCheck, FiMapPin } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import PlaceholderImage from "@/components/marketing/PlaceholderImage";
import Reveal from "@/components/marketing/Reveal";
import StatCounter from "@/components/marketing/StatCounter";
import {
  chinaHighlights,
  chinaStats,
  secondaryCta,
} from "@/lib/marketing-content";

const photos = [
  "Team on the ground",
  "Factory visit",
  "Quality inspection",
  "Shipping & consolidation",
];

export default function AboutChinaBridge() {
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
                We are not a catalog reseller. We verify factories, inspect
                quality, negotiate prices, consolidate orders, and ship
                door-to-door — so you get factory-direct economics with real
                accountability.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {chinaHighlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-white/80"
                  >
                    <FiCheck
                      className="h-4 w-4 shrink-0 text-gold"
                      aria-hidden="true"
                    />
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
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="relative h-40 overflow-hidden rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgba(200,16,46,0.35),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(212,160,23,0.25),transparent_45%)]">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.15) 1px, transparent 1px)",
                      backgroundSize: "28px 28px",
                    }}
                  />
                  <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <FiMapPin className="h-6 w-6 text-gold" aria-hidden="true" />
                    <span className="mt-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                      China
                    </span>
                  </span>
                  <span className="absolute bottom-2 right-2 rounded bg-black/30 px-2 py-0.5 text-[10px] text-white/50">
                    Map placeholder
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <PlaceholderImage
                    key={photo}
                    label={photo}
                    aspect="aspect-[4/3]"
                    className="rounded-xl p-2"
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
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
