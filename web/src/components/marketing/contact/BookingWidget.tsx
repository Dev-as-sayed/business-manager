"use client";

import { FiCalendar, FiCheckCircle, FiClock } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const slots = ["09:00", "10:30", "13:00", "15:00", "16:30"];

export default function BookingWidget() {
  return (
    <section
      id="booking"
      className="scroll-mt-24 border-y border-border bg-secondary-background/60 py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                Book a consultation
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-text-primary sm:text-4xl">
                Prefer to Talk? Book a Free 20-Minute Consultation.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
                Bring your idea, product link, or sketch. We will walk through
                the fastest path to launch and tell you what it takes.
              </p>
              <ul className="mt-6 space-y-2">
                {[
                  "No obligation and no pressure",
                  "A clear next step, even if you are not ready",
                  "A real person who knows sourcing, stores, and marketing",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-text-secondary"
                  >
                    <FiCheckCircle
                      className="h-4 w-4 shrink-0 text-action"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Button href="#contact-form" size="lg" className="mt-7" arrow>
                Request a Time
              </Button>
              <p className="mt-3 text-[11px] text-text-muted">
                Live booking is a placeholder — connect Calendly or Cal.com
                before launch.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <FiCalendar className="h-4 w-4 text-gold" aria-hidden="true" />
                  Select a slot
                </p>
                <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  Placeholder
                </span>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                {days.map((day) => (
                  <div
                    key={day}
                    className="text-[10px] font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {day}
                  </div>
                ))}
                {slots.map((slot) =>
                  days.map((day) => (
                    <span
                      key={`${day}-${slot}`}
                      className="rounded-lg border border-border bg-background px-1 py-2 text-[11px] font-medium text-text-secondary"
                    >
                      {slot}
                    </span>
                  )),
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-[11px] text-text-muted">
                <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
                China Standard Time (UTC+8) · your local time shown on booking
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
