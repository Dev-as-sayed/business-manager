"use client";

import { useEffect, useState } from "react";
import { servicesPageContent } from "@/lib/marketing-pages";

const tabs = servicesPageContent.services.map((service) => ({
  id: service.slug,
  label: service.title,
}));

export default function ServiceTabs() {
  const [active, setActive] = useState<string>(tabs[0].id);

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-16 z-30 border-y border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav className="flex gap-1 py-2" aria-label="Service sections">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              aria-current={active === tab.id ? "true" : undefined}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                active === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-text-secondary hover:bg-accent hover:text-text-primary"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
