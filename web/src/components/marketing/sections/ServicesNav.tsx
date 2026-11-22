"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/marketing/ui/Container";
import { services, serviceOrder } from "@/content/services";
import { cn } from "@/lib/utils";

const navIds = [...serviceOrder, "packages", "journey"] as const;

const navLabels: Record<string, string> = {
  packages: "Packages",
  journey: "Journey",
};

export function ServicesNav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = navIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75] },
    );

    sections.forEach((section) => observer.observe(section));

    const onHash = () => setActive(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHash);
    onHash();

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  return (
    <nav
      aria-label="Services navigation"
      className="sticky top-[var(--header-h)] z-30 border-b border-line bg-paper/95 backdrop-blur-md"
    >
      <Container className="no-scrollbar flex gap-2 overflow-x-auto py-3">
        {navIds.map((id) => {
          const service = services.find((item) => item.id === id);
          const label = service?.shortName ?? navLabels[id] ?? id;
          const isActive = active === id;

          return (
            <Link
              key={id}
              href={`#${id}`}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                isActive
                  ? "border-lime bg-lime text-lime-contrast"
                  : "border-line bg-surface text-ink hover:bg-surface-2",
              )}
            >
              {label}
            </Link>
          );
        })}
      </Container>
    </nav>
  );
}
