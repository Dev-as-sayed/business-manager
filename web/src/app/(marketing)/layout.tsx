import { Header } from "@/components/marketing/layout/Header";
import { Footer } from "@/components/marketing/layout/Footer";
import { StickyMobileCTA } from "@/components/marketing/layout/StickyMobileCTA";
import { JsonLd } from "@/components/marketing/ui/JsonLd";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: site.name,
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
      description: site.description,
      email: site.email,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: site.email,
        availableLanguage: ["English"],
        areaServed: "Worldwide",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: site.name,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en",
    },
  ],
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing min-h-screen bg-paper text-ink">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <div aria-hidden="true" className="h-[76px] md:hidden" />
      <StickyMobileCTA />
      <JsonLd data={organizationSchema} />
    </div>
  );
}
