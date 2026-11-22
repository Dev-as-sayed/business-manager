"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Logo from "@/components/marketing/Logo";
import LocaleSwitcher from "@/components/marketing/LocaleSwitcher";
import { navLinks, primaryCta, servicesNav } from "@/lib/marketing-content";

export default function SiteHeader() {
  const pathname = usePathname();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setMobileOpen(false);
      }
    };
    const onClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      pathname === href
        ? "bg-primary/10 text-primary"
        : "text-text-secondary hover:bg-accent hover:text-text-primary"
    }`;

  const servicesActive = pathname.startsWith("/services");

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all ${
        scrolled
          ? "border-border bg-background/90 shadow-sm backdrop-blur-md"
          : "border-transparent bg-background/70 backdrop-blur-md"
      }`}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
        aria-label="Main navigation"
      >
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setServicesOpen((open) => !open)}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                servicesActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-accent hover:text-text-primary"
              }`}
            >
              Services
              <FiChevronDown
                className={`h-4 w-4 transition-transform ${
                  servicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {servicesOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card p-2 shadow-card">
                {servicesNav.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setServicesOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-accent hover:text-text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/services"
                  onClick={() => setServicesOpen(false)}
                  className="mt-1 block rounded-lg bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  View all services
                </Link>
              </div>
            )}
          </div>

          {navLinks.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher />
          <Button href={primaryCta.href} size="sm">
            {primaryCta.label}
          </Button>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-text-secondary transition hover:bg-accent hover:text-text-primary lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto max-h-[calc(100vh-4rem)] max-w-6xl overflow-y-auto px-4 pb-8 pt-3 sm:px-6">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-text-secondary hover:bg-accent hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setMobileServicesOpen((open) => !open)}
              aria-expanded={mobileServicesOpen}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-text-secondary hover:bg-accent"
            >
              Services
              <FiChevronDown
                className={`h-4 w-4 transition-transform ${
                  mobileServicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {mobileServicesOpen && (
              <div className="ml-2 border-l border-border pl-3">
                {servicesNav.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-accent hover:text-text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/services"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  View all services
                </Link>
              </div>
            )}

            {navLinks.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-medium text-text-secondary hover:bg-accent hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 border-t border-border pt-4">
              <LocaleSwitcher />
            </div>

            <div className="mt-4">
              <Button
                href={primaryCta.href}
                className="w-full"
                onClick={() => setMobileOpen(false)}
              >
                {primaryCta.label}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
