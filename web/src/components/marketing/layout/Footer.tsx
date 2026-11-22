import Link from "next/link";
import {
  FiClock,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiYoutube,
} from "react-icons/fi";
import { FaApple, FaGooglePlay, FaXTwitter } from "react-icons/fa6";
import { Container } from "@/components/marketing/ui/Container";
import { Logo } from "@/components/marketing/layout/Logo";
import { NewsletterForm } from "@/components/marketing/layout/NewsletterForm";
import { PlaceholderLink } from "@/components/marketing/layout/PlaceholderLink";
import { services } from "@/content/services";
import { ctaLinks, site } from "@/content/site";
import { messages } from "@/i18n/messages/en";

const pageLinks = [
  { href: "/", label: messages.nav.home },
  { href: "/about", label: messages.nav.about },
  { href: "/services", label: messages.nav.services },
  { href: "/contact", label: messages.nav.contact },
  { href: ctaLinks.consultation, label: messages.nav.consultation },
];

const socialIcons = [
  { label: "Instagram", icon: FiInstagram },
  { label: "LinkedIn", icon: FiLinkedin },
  { label: "YouTube", icon: FiYoutube },
  { label: "X", icon: FaXTwitter },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-band text-white">
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-lime/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="blueprint-grid-inverse pointer-events-none absolute inset-0 opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-lime/10 blur-3xl"
      />

      <Container className="relative py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.7fr_1fr_1.1fr]">
          <div>
            <Logo tone="inverse" />
            <p className="mt-5 max-w-sm text-sm leading-[1.65] text-band-muted">
              Omnia connects product sourcing, custom development, e-commerce
              software, content, and marketing under one roof — so founders can
              launch without juggling five vendors.
            </p>
            <div className="mt-7">
              <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-white">
                {messages.footer.newsletterTitle}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-[1.65] text-band-muted">
                {messages.footer.newsletterBody}
              </p>
              <NewsletterForm />
            </div>
          </div>

          <nav aria-label="Footer pages">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-band-muted">
              {messages.footer.pages}
            </h2>
            <ul className="mt-4 space-y-3">
              {pageLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-lime"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer services">
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-band-muted">
              {messages.footer.services}
            </h2>
            <ul className="mt-4 space-y-3">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services#${service.id}`}
                    className="text-sm text-white/80 transition-colors hover:text-lime"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-band-muted">
              {messages.footer.contact}
            </h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-start gap-2 text-white/80 transition-colors hover:text-lime"
                >
                  <FiMail
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.whatsappHref}
                  className="inline-flex items-start gap-2 text-white/80 transition-colors hover:text-lime"
                >
                  <FiMessageCircle
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                  WhatsApp {site.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-start gap-2 text-white/80 transition-colors hover:text-lime"
                >
                  <FiPhone
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                  />
                  {site.phoneDisplay}
                </a>
              </li>
              {site.addresses.map((address) => (
                <li key={address.id}>
                  <div className="flex items-start gap-2 text-white/80">
                    <FiMapPin
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <div>
                      <p className="font-medium text-white/90">
                        {address.label}
                      </p>
                      {address.lines.map((line) => (
                        <p key={line} className="text-sm text-band-muted">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
              <li className="flex items-start gap-2 text-white/80">
                <FiClock
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                />
                <div>
                  {site.hours.map((hours) => (
                    <p key={hours.label} className="text-sm text-band-muted">
                      <span className="text-white/80">{hours.label}:</span>{" "}
                      {hours.value}
                    </p>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {socialIcons.map((social) => {
              const Icon = social.icon;
              return (
                <PlaceholderLink
                  key={social.label}
                  label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-lime hover:text-lime"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </PlaceholderLink>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <PlaceholderLink
              label="iOS app"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/70 transition-colors hover:border-lime hover:text-lime"
            >
              <FaApple aria-hidden="true" className="h-4 w-4" />
              <span>{messages.footer.appSoon}</span>
            </PlaceholderLink>
            <PlaceholderLink
              label="Android app"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm text-white/70 transition-colors hover:border-lime hover:text-lime"
            >
              <FaGooglePlay aria-hidden="true" className="h-3.5 w-3.5" />
              <span>{messages.footer.appSoon}</span>
            </PlaceholderLink>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-band-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {messages.footer.rights}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className="transition-colors hover:text-lime">
              {messages.footer.terms}
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-lime">
              {messages.footer.privacy}
            </Link>
            <span className="text-white/35">
              {messages.footer.placeholderNote}
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
