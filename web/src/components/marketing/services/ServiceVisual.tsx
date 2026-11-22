"use client";

import {
  FiCheck,
  FiGlobe,
  FiTruck,
} from "react-icons/fi";
import PlaceholderImage from "@/components/marketing/PlaceholderImage";
import type { ServiceSlug } from "@/lib/marketing-pages";

const bars = [38, 58, 44, 72, 64, 88, 76, 94, 70, 86];
const contentTiles = [
  { label: "Raw photo", hint: "Before" },
  { label: "Studio shot", hint: "After" },
  { label: "Unedited clip", hint: "Before" },
  { label: "Edited reel", hint: "After" },
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
      {children}
    </span>
  );
}

export default function ServiceVisual({ variant }: { variant: ServiceSlug }) {
  if (variant === "sourcing") {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gold">
            China → your door
          </span>
          <Badge>Illustrative diagram</Badge>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
              <FiGlobe className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-2 text-sm font-semibold text-text-primary">China</p>
            <p className="text-xs text-text-muted">Factory floor</p>
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
            <p className="mt-2 text-sm font-semibold text-text-primary">Your door</p>
            <p className="text-xs text-text-muted">Anywhere</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {["Vet", "Negotiate", "QC"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-2 py-2 text-xs font-medium text-text-secondary"
            >
              <FiCheck className="h-3.5 w-3.5 text-action" aria-hidden="true" />
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "development") {
    const steps = [
      "Sketch",
      "3D design",
      "Prototype",
      "Sample approval",
      "Mass production",
      "Packaging",
    ];
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gold">
            Sketch → shelf
          </span>
          <Badge>Illustrative diagram</Badge>
        </div>
        <ol className="mt-5 space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-1.5 rounded-full bg-gradient-to-r from-primary to-gold"
                  style={{ width: `${((index + 1) / steps.length) * 100}%` }}
                />
              </span>
              <span className="w-28 text-right text-xs font-medium text-text-secondary">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (variant === "software") {
    return (
      <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-3 px-1 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gold">
            One dashboard
          </span>
          <Badge>Illustrative mockup</Badge>
        </div>
        <div className="rounded-2xl bg-launcher-ink p-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="h-2.5 w-2.5 rounded-full bg-action" />
            <span className="ml-3 flex-1 rounded-md bg-white/10 px-3 py-1 text-[10px] text-white/50">
              app.thebrandlauncher.com
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Revenue", value: "$8.4k" },
              { label: "Orders", value: "126" },
              { label: "Customers", value: "89" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-wide text-white/40">
                  {stat.label}
                </p>
                <p className="mt-1 text-lg font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-white/5 p-3">
            <p className="text-xs font-semibold text-white">Orders</p>
            <div className="mt-3 flex h-16 items-end gap-1.5">
              {bars.map((height, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-gold"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-2 h-2 w-1/2 rounded-b-xl bg-border" />
      </div>
    );
  }

  if (variant === "content") {
    return (
      <div className="rounded-3xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between gap-3 px-1 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-gold">
            Before / after
          </span>
          <Badge>Placeholder gallery</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {contentTiles.map((tile) => (
            <PlaceholderImage
              key={tile.label}
              label={tile.label}
              hint={tile.hint}
              aspect="aspect-square"
              className="rounded-xl p-2"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gold">
          Campaign snapshot
        </span>
        <Badge>Sample metrics — placeholder</Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { value: "+120%", label: "Traffic" },
          { value: "+40%", label: "Orders" },
          { value: "2.4x", label: "ROAS" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl bg-accent p-3 text-center">
            <p className="text-lg font-bold text-primary">{metric.value}</p>
            <p className="text-[10px] font-medium text-text-muted">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex h-24 items-end gap-1.5">
        {bars.map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-gold"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <p className="mt-3 text-[11px] text-text-muted">
        Replace with verified campaign results before launch.
      </p>
    </div>
  );
}
