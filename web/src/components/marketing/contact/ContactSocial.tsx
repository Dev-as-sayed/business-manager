"use client";

import { FaTiktok } from "react-icons/fa";
import { FiInstagram, FiLinkedin, FiMail, FiYoutube } from "react-icons/fi";
import { contact, socialLinks } from "@/lib/marketing-content";

const icons = [FiInstagram, FaTiktok, FiLinkedin, FiYoutube];

export default function ContactSocial() {
  return (
    <section className="px-4 pb-20 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-card p-6 shadow-soft sm:flex-row">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Follow the launch
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Social links are placeholders — add your real profiles before launch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {socialLinks.map((social, index) => {
            const Icon = icons[index] ?? FiInstagram;
            return (
              <a
                key={social.label}
                href={social.href}
                aria-label={`${social.label} (placeholder link)`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            );
          })}
          <a
            href={`mailto:${contact.email}`}
            className="ml-2 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15"
          >
            <FiMail className="h-4 w-4" aria-hidden="true" />
            Email us
          </a>
        </div>
      </div>
    </section>
  );
}
