"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiMail,
  FiMenu,
  FiMessageCircle,
  FiX,
} from "react-icons/fi";
import { Button } from "@/components/marketing/ui/Button";
import { Container } from "@/components/marketing/ui/Container";
import { ServiceIcon } from "@/components/marketing/ui/ServiceIcon";
import { LanguageSelector } from "@/components/marketing/layout/LanguageSelector";
import { Logo } from "@/components/marketing/layout/Logo";
import { ThemeToggle } from "@/components/marketing/layout/ThemeToggle";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { services } from "@/content/services";
import { ctaLinks, site } from "@/content/site";
import { messages } from "@/i18n/messages/en";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: messages.nav.home },
  { href: "/about", label: messages.nav.about },
  { href: "/contact", label: messages.nav.contact },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useFocusTrap(mobileOpen, mobilePanelRef, closeMenu);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const servicesActive = pathname.startsWith("/services");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-line bg-paper/90 backdrop-blur-xl"
          : "border-b border-transparent bg-paper/70 backdrop-blur-md",
      )}
    >
      <Container className="flex h-[var(--header-h)] items-center justify-between gap-3">
        <Logo />

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "text-ink"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {link.label}
              {isActive(link.href) ? (
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-lime" />
              ) : null}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
            onFocus={() => setServicesOpen(true)}
            onBlur={(event) => {
              if (
                !event.currentTarget.contains(event.relatedTarget as Node)
              ) {
                setServicesOpen(false);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setServicesOpen(false);
                servicesButtonRef.current?.focus();
              }
            }}
          >
            <button
              ref={servicesButtonRef}
              type="button"
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              aria-controls="desktop-services-menu"
              onClick={() => setServicesOpen((open) => !open)}
              className={cn(
                "inline-flex items-center gap-1.5 py-2 text-sm font-medium transition-colors",
                servicesActive
                  ? "text-ink"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {messages.nav.services}
              <FiChevronDown
                aria-hidden="true"
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  servicesOpen && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence>
              {servicesOpen ? (
                <motion.div
                  id="desktop-services-menu"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 top-full z-50 mt-3 w-[560px] -translate-x-1/2 rounded-3xl border border-line bg-surface p-3 shadow-lift"
                >
                  <div className="grid gap-1">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/services#${service.id}`}
                        onClick={() => setServicesOpen(false)}
                        className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-2"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-soft text-ink">
                          <ServiceIcon service={service.id} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-ink">
                            {service.name}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                            {service.tagline}
                          </span>
                        </span>
                        <FiArrowUpRight
                          aria-hidden="true"
                          className="mt-1 h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-band px-4 py-3 text-white">
                    <span className="text-xs text-band-muted">
                      Not sure where to start?
                    </span>
                    <Link
                      href={ctaLinks.consultation}
                      onClick={() => setServicesOpen(false)}
                      className="text-xs font-semibold text-lime hover:underline"
                    >
                      Book a free consultation
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <Link
            href={navLinks[2].href}
            aria-current={isActive(navLinks[2].href) ? "page" : undefined}
            className={cn(
              "relative py-2 text-sm font-medium transition-colors",
              isActive(navLinks[2].href)
                ? "text-ink"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {navLinks[2].label}
            {isActive(navLinks[2].href) ? (
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-lime" />
            ) : null}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden xl:block">
            <LanguageSelector />
          </div>
          <ThemeToggle />
          <div className="hidden sm:block">
            <Button href={ctaLinks.start} size="sm" arrow>
              {messages.nav.start}
            </Button>
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? messages.nav.close : messages.nav.menu}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/60 text-ink transition-colors hover:bg-surface-2 lg:hidden"
          >
            {mobileOpen ? (
              <FiX aria-hidden="true" className="h-5 w-5" />
            ) : (
              <FiMenu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            ref={mobilePanelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-100%)] overflow-y-auto overscroll-contain bg-paper lg:hidden"
          >
            <Container className="flex min-h-full flex-col py-5">
              <button
                type="button"
                onClick={closeMenu}
                className="mb-3 inline-flex items-center gap-2 self-end rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink"
              >
                <FiX aria-hidden="true" className="h-4 w-4" />
                Close
              </button>

              <nav aria-label="Mobile navigation">
                <div className="divide-y divide-line border-y border-line">
                  {navLinks.slice(0, 2).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className="flex items-center justify-between py-4 font-display text-2xl font-semibold tracking-[-0.03em] text-ink"
                    >
                      {link.label}
                      <FiArrowUpRight
                        aria-hidden="true"
                        className="h-5 w-5 text-ink-muted"
                      />
                    </Link>
                  ))}
                </div>

                <details className="group border-b border-line">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {messages.nav.services}
                    <FiChevronDown
                      aria-hidden="true"
                      className="h-5 w-5 text-ink-muted transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="grid gap-1 pb-4">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/services#${service.id}`}
                        onClick={closeMenu}
                        className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-surface-2"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-soft text-ink">
                          <ServiceIcon service={service.id} className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-semibold text-ink">
                          {service.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </details>

                <div className="divide-y divide-line border-b border-line">
                  <Link
                    href={navLinks[2].href}
                    onClick={closeMenu}
                    className="flex items-center justify-between py-4 font-display text-2xl font-semibold tracking-[-0.03em] text-ink"
                  >
                    {navLinks[2].label}
                    <FiArrowUpRight
                      aria-hidden="true"
                      className="h-5 w-5 text-ink-muted"
                    />
                  </Link>
                </div>
              </nav>

              <div className="mt-auto pt-8">
                <Button
                  href={ctaLinks.start}
                  onClick={closeMenu}
                  size="lg"
                  fullWidth
                  arrow
                >
                  {messages.nav.start}
                </Button>

                <div className="mt-4 flex items-center justify-between">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>

                <div className="mt-6 grid gap-2 text-sm text-ink-muted">
                  <a
                    href={site.whatsappHref}
                    className="inline-flex items-center gap-2 hover:text-ink"
                  >
                    <FiMessageCircle aria-hidden="true" className="h-4 w-4" />
                    WhatsApp {site.whatsappDisplay}
                  </a>
                  <a
                    href={`mailto:${site.email}`}
                    className="inline-flex items-center gap-2 hover:text-ink"
                  >
                    <FiMail aria-hidden="true" className="h-4 w-4" />
                    {site.email}
                  </a>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                  We reply within 24 hours. Contact details are placeholders.
                </p>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
