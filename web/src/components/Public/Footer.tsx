"use client";

import Link from "next/link";
import { FiMail } from "react-icons/fi";
import { FaRocket } from "react-icons/fa";

const company = [
  { title: "Home", path: "/" },
  { title: "About", path: "/about" },
  { title: "Services", path: "/services" },
  { title: "Contact", path: "/contact" },
];

const services = [
  "AI Website Builder",
  "Product Sourcing",
  "Door-to-Door Logistics",
  "Business CRM",
  "SEO & Marketing",
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <FaRocket className="h-5 w-5" />
            </span>
            <span className="text-base font-bold text-text-primary">
              The Brand Launcher
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-text-secondary">
            The all-in-one, zero-to-launch ecosystem for entrepreneurs and small
            businesses.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">
            Company
          </h4>
          <ul className="space-y-2">
            {company.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className="text-sm text-text-secondary transition hover:text-primary"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">
            Services
          </h4>
          <ul className="space-y-2">
            {services.map((item) => (
              <li key={item}>
                <Link
                  href="/services"
                  className="text-sm text-text-secondary transition hover:text-primary"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-primary">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>
              <a
                href="mailto:hello@omnia.amsayed.store"
                className="flex items-center gap-2 transition hover:text-primary"
              >
                <FiMail className="h-4 w-4" />
                hello@omnia.amsayed.store
              </a>
            </li>
            <li className="text-text-muted">China → Worldwide</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} The Brand Launcher. All rights reserved.
      </div>
    </footer>
  );
}
