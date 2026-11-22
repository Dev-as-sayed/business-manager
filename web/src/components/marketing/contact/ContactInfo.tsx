"use client";

import { FaWhatsapp } from "react-icons/fa";
import { FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { contact } from "@/lib/marketing-content";
import { contactPageContent } from "@/lib/marketing-pages";

const quickCards = [
  {
    label: "WhatsApp",
    value: contact.whatsapp,
    href: contact.whatsappHref,
    icon: FaWhatsapp,
    note: "Placeholder number",
  },
  {
    label: "Email",
    value: contact.email,
    href: `mailto:${contact.email}`,
    icon: FiMail,
    note: "Placeholder inbox",
  },
  {
    label: "Phone",
    value: contact.phone,
    href: `tel:${contact.phone.replace(/\s/g, "")}`,
    icon: FiPhone,
    note: "Placeholder number",
  },
];

export default function ContactInfo() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-text-primary">Quick contact</h2>
        <div className="mt-4 space-y-3">
          {quickCards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.label}
                href={card.href}
                className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                    {card.label}
                  </span>
                  <span className="block truncate text-sm font-medium text-text-primary">
                    {card.value}
                  </span>
                  <span className="block text-[10px] text-text-muted">
                    {card.note}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-text-primary">Locations</h2>
        <div className="mt-4 space-y-4">
          {contactPageContent.locations.map((location) => (
            <div key={location.label} className="flex items-start gap-3">
              <FiMapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {location.label}
                </p>
                <p className="text-xs text-text-secondary">{location.value}</p>
                <p className="text-[10px] text-text-muted">{location.note}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-accent px-3 py-2 text-[10px] text-text-muted">
          Addresses are placeholders — replace with real office and warehouse
          locations.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
          <FiClock className="h-4 w-4 text-gold" aria-hidden="true" />
          Working hours
        </h2>
        <div className="mt-3 space-y-1 text-sm text-text-secondary">
          {contactPageContent.workingHours.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-text-muted">
          Time zones: China Standard Time (UTC+8). We also schedule calls in
          your local time.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="relative h-44 bg-[radial-gradient(circle_at_30%_30%,rgba(200,16,46,0.18),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(212,160,23,0.2),transparent_45%)]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(26,15,15,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,15,15,.12) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg">
              <FiMapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-2 rounded-full bg-card px-3 py-1 text-[10px] font-semibold text-text-secondary shadow">
              Map placeholder
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
