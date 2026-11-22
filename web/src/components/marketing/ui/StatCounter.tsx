"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PlaceholderTag } from "./PlaceholderTag";

export function StatCounter({
  value,
  label,
  note,
  tone = "default",
  className,
}: {
  value: string | number;
  label: string;
  note?: string;
  tone?: "default" | "inverse";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const isNumeric = typeof value === "number";
  const [display, setDisplay] = useState<string | number>(
    isNumeric ? 0 : value,
  );

  useEffect(() => {
    if (!isNumeric || !inView) return;

    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, isNumeric, reduceMotion, value]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-2",
        tone === "inverse" ? "text-white" : "text-ink",
        className,
      )}
      aria-label={`${label}: ${value}`}
    >
      <span className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] sm:text-5xl">
        {display}
        {isNumeric ? <span className="text-lime-ink">+</span> : null}
      </span>
      <span
        className={cn(
          "text-sm font-medium",
          tone === "inverse" ? "text-band-muted" : "text-ink-muted",
        )}
      >
        {label}
      </span>
      {note ? (
        <PlaceholderTag
          label={note}
          tone={tone === "inverse" ? "inverse" : "default"}
          className="w-fit"
        />
      ) : null}
    </div>
  );
}
