"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiArrowRight, FiMenu, FiX } from "react-icons/fi";
import { FaRocket } from "react-icons/fa";

const links = [
  { title: "Home", path: "/" },
  { title: "About", path: "/about" },
  { title: "Services", path: "/services" },
  { title: "Contact", path: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md transition-all ${
        scrolled
          ? "bg-background/85 border-border shadow-sm"
          : "bg-background/60 border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-md">
            <FaRocket className="h-5 w-5" />
          </span>
          <span className="text-base font-bold leading-tight text-text-primary sm:text-lg">
            The Brand Launcher
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              link.path === "/"
                ? pathname === "/"
                : pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-text-secondary hover:text-text-primary hover:bg-accent"
                }`}
              >
                {link.title}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:block">
          <Link
            href="/auth"
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
          >
            Sign In
            <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg p-2 text-text-secondary hover:bg-accent hover:text-text-primary md:hidden"
        >
          {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-2">
            {links.map((link) => {
              const active =
                link.path === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-accent"
                  }`}
                >
                  {link.title}
                </Link>
              );
            })}
            <Link
              href="/auth"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Sign In
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
