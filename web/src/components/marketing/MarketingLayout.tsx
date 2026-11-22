import type { ReactNode } from "react";
import JsonLd from "@/components/marketing/JsonLd";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import StickyMobileCTA from "@/components/marketing/StickyMobileCTA";
import { organizationJsonLd } from "@/lib/seo";

export default function MarketingLayout({
  children,
  jsonLd = [],
}: {
  children: ReactNode;
  jsonLd?: unknown[];
}) {
  return (
    <div className="theme-launcher min-h-screen bg-background text-text-primary">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <JsonLd data={organizationJsonLd()} />
      {jsonLd.map((data, index) => (
        <JsonLd key={index} data={data} />
      ))}

      <SiteHeader />

      <main id="main">{children}</main>

      <SiteFooter />
      <StickyMobileCTA />
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  );
}
