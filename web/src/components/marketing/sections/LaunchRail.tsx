"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiCamera,
  FiCheck,
  FiMonitor,
  FiPackage,
  FiPenTool,
  FiTool,
  FiUser,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const stages = [
  { label: "Idea", detail: "Your brief", icon: FiPenTool },
  { label: "Factory", detail: "Vetted partner", icon: FiTool },
  { label: "Product", detail: "Sample approved", icon: FiPackage },
  { label: "Website", detail: "Store live", icon: FiMonitor },
  { label: "Content", detail: "Assets ready", icon: FiCamera },
  { label: "Customer", detail: "First order", icon: FiUser },
];

export function LaunchRail() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setActive(stages.length - 1);
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % stages.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const current = stages[active];

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-lime/30 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-lime/15 blur-2xl"
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface p-5 shadow-soft sm:p-6">
        <div
          aria-hidden="true"
          className="blueprint-grid pointer-events-none absolute inset-0 opacity-50"
        />

        <div className="relative flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
              Launch route
            </p>
            <p className="mt-1 font-display text-lg font-semibold tracking-[-0.03em] text-ink">
              One team, six handoffs, zero vendors.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-strong" />
            Live route
          </span>
        </div>

        <div className="relative mt-8 hidden sm:block">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-5 h-px bg-line"
          />
          <div
            aria-hidden="true"
            className="absolute left-0 top-5 h-px bg-lime transition-all duration-700 ease-out"
            style={{ width: `${(active / (stages.length - 1)) * 100}%` }}
          />
          <ol className="relative grid grid-cols-6 gap-2">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const completed = index < active;
              const isActive = index === active;
              return (
                <li
                  key={stage.label}
                  className="flex flex-col items-center text-center"
                >
                  <span
                    className={cn(
                      "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isActive &&
                        "scale-110 border-lime bg-lime text-lime-contrast shadow-[0_0_0_5px_rgba(200,241,105,0.2)]",
                      completed && "border-ink bg-ink text-lime",
                      !completed &&
                        !isActive &&
                        "border-line bg-surface text-ink-muted",
                    )}
                  >
                    {completed ? (
                      <FiCheck aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "mt-2.5 text-[11px] font-semibold leading-tight",
                      completed || isActive
                        ? "text-ink"
                        : "text-ink-muted",
                    )}
                  >
                    {stage.label}
                  </span>
                  <span className="mt-0.5 text-[10px] leading-tight text-ink-muted">
                    {stage.detail}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="relative mt-6 sm:hidden">
          <ol className="space-y-0">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const completed = index < active;
              const isActive = index === active;
              return (
                <li
                  key={stage.label}
                  className="relative flex items-start gap-3 pb-4 last:pb-0"
                >
                  {index < stages.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-5 top-10 h-[calc(100%-1.25rem)] w-px",
                        index < active ? "bg-lime" : "bg-line",
                      )}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isActive && "border-lime bg-lime text-lime-contrast",
                      completed && "border-ink bg-ink text-lime",
                      !completed &&
                        !isActive &&
                        "border-line bg-surface text-ink-muted",
                    )}
                  >
                    {completed ? (
                      <FiCheck aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    )}
                  </span>
                  <span className="pt-1.5">
                    <span
                      className={cn(
                        "block text-sm font-semibold",
                        completed || isActive ? "text-ink" : "text-ink-muted",
                      )}
                    >
                      {stage.label}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {stage.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-2xl bg-band p-4 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-lime/15 blur-2xl"
          />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-band-muted">
                Stage {String(active + 1).padStart(2, "0")} / 06
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={current.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 text-sm font-semibold text-white"
                >
                  {current.detail}
                </motion.p>
              </AnimatePresence>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime text-lime-contrast">
              <FiCheck aria-hidden="true" className="h-4 w-4" />
            </span>
          </div>
        </div>

        <span className="sr-only">
          Launch route: idea, factory, product, website, content, customer.
        </span>
      </div>

      <div className="absolute -bottom-4 left-5 hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-muted shadow-soft sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-lime-strong" />
        Door-to-door
      </div>
      <div className="absolute -right-3 top-24 hidden rotate-2 items-center gap-2 rounded-full border border-line bg-lime px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-lime-contrast shadow-soft lg:flex">
        One team
      </div>
    </div>
  );
}
