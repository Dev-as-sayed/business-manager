"use client";

import { useEffect, useState } from "react";
import { FiGlobe } from "react-icons/fi";
import { locales } from "@/lib/marketing-content";

export default function LocaleSwitcher({
  variant = "header",
}: {
  variant?: "header" | "footer";
}) {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    if (match) setLocale(decodeURIComponent(match[1]));
  }, []);

  const change = (value: string) => {
    setLocale(value);
    document.cookie = `locale=${value}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
  };

  const footer = variant === "footer";

  return (
    <label
      className={`inline-flex items-center gap-2 text-sm ${
        footer ? "text-white/60" : "text-text-secondary"
      }`}
    >
      <FiGlobe className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">Language and currency</span>
      <select
        value={locale}
        onChange={(event) => change(event.target.value)}
        aria-label="Language and currency"
        className={`rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 ${
          footer
            ? "border-white/15 bg-white/5 text-white focus:ring-gold"
            : "border-border bg-background text-text-primary focus:ring-primary"
        }`}
      >
        {locales.map((item) => (
          <option key={item.code} value={item.code} className="text-black">
            {item.label} · {item.currency}
          </option>
        ))}
      </select>
    </label>
  );
}
