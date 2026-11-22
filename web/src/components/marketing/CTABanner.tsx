"use client";

import { FiMail, FiMessageCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import { contact, primaryCta } from "@/lib/marketing-content";

export default function CTABanner() {
  return (
    <section className="px-4 pb-20 pt-4 sm:px-6">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-launcher-ink px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <h2 className="relative text-3xl font-bold sm:text-4xl lg:text-5xl">
            Ready to Launch Your Brand?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/80">
            One team. One timeline. From your first idea to your first sale.
          </p>

          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={primaryCta.href} variant="gold" size="lg" arrow>
              {primaryCta.label}
            </Button>
            <Button
              href="/contact?intent=consultation"
              variant="dark"
              size="lg"
              className="border border-white/20"
            >
              Book a Free Consultation
            </Button>
          </div>

          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 text-sm text-white/70 sm:flex-row sm:gap-6">
            <a
              href={contact.whatsappHref}
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <FaWhatsapp className="h-4 w-4 text-gold" aria-hidden="true" />
              WhatsApp: {contact.whatsapp}
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <FiMail className="h-4 w-4 text-gold" aria-hidden="true" />
              {contact.email}
            </a>
          </div>

          <p className="relative mt-4 inline-flex items-center gap-1 text-[11px] text-white/40">
            <FiMessageCircle className="h-3 w-3" aria-hidden="true" />
            Contact details are placeholders — update before launch.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
