"use client";

import { useState } from "react";
import { FiChevronDown, FiGlobe } from "react-icons/fi";
import {
  localeLabels,
  localeStatus,
  locales,
  type Locale,
} from "@/i18n/config";
import { useToast } from "@/context/ToastProvider";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className }: { className?: string }) {
  const [locale, setLocale] = useState<Locale>("en");
  const { toast } = useToast();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as Locale;
    if (localeStatus[next] !== "ready") {
      toast(
        "info",
        `${localeLabels[next]} is coming soon. Showing English for now.`,
      );
      setLocale("en");
      return;
    }
    setLocale(next);
  };

  return (
    <div
      className={cn(
        "relative inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface/60 pl-3 pr-8 text-ink transition-colors hover:bg-surface-2",
        className,
      )}
    >
      <FiGlobe aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-muted" />
      <label className="sr-only" htmlFor="language-selector">
        Language
      </label>
      <select
        id="language-selector"
        value={locale}
        onChange={handleChange}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-sm font-medium text-ink outline-none"
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {localeLabels[item]}
            {localeStatus[item] === "coming-soon" ? " (soon)" : ""}
          </option>
        ))}
      </select>
      <FiChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 h-4 w-4 text-ink-muted"
      />
    </div>
  );
}
