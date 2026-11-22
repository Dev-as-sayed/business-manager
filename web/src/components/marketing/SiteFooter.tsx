"use client";

import Link from "next/link";
import { FaApple, FaGooglePlay, FaTiktok, FaWhatsapp } from "react-icons/fa";
import {
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiYoutube,
} from "react-icons/fi";
import Logo from "@/components/marketing/Logo";
import LocaleSwitcher from "@/components/marketing/LocaleSwitcher";
import NewsletterForm from "@/components/marketing/NewsletterForm";
import {
  appLinks,
  contact,
  footerColumns,
  socialLinks,
} from "@/lib/marketing-content";

const socialIcons = [FiInstagram, FaTiktok, FiLinkedin, FiYoutube];

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-launcher-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-sm text-sm text-white/60">
              Source or create your product in China, build your store, produce
              your content, and market it — with one team.
            </p>
            <NewsletterForm />
            <div className="mt-6 flex gap-2">
              {socialLinks.map((social, index) => {
                const Icon = socialIcons[index] ?? FiInstagram;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={`${social.label} (placeholder link)`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-gold hover:text-gold"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-start gap-2 transition hover:text-gold"
                >
                  <FiMail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={contact.whatsappHref}
                  className="inline-flex items-start gap-2 transition hover:text-gold"
                >
                  <FaWhatsapp className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>WhatsApp: {contact.whatsapp}</span>
                </a>
              </li>
              <li className="inline-flex items-start gap-2">
                <FiPhone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{contact.phone}</span>
              </li>
              <li className="inline-flex items-start gap-2">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{contact.chinaOffice}</span>
              </li>
              <li className="inline-flex items-start gap-2">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{contact.hq}</span>
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-white/40">
              Contact details and addresses are placeholders.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <a
              href={appLinks.appStore}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-white/80 transition hover:border-gold hover:text-gold"
              aria-label="App Store (placeholder link)"
            >
              <FaApple className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold">App Store</span>
            </a>
            <a
              href={appLinks.googlePlay}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-white/80 transition hover:border-gold hover:text-gold"
              aria-label="Google Play (placeholder link)"
            >
              <FaGooglePlay className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-semibold">Google Play</span>
            </a>
          </div>

          <LocaleSwitcher variant="footer" />
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} The Brand Launcher. All rights
            reserved.
          </p>
          <p>Built for founders launching from zero.</p>
        </div>
      </div>
    </footer>
  );
}
