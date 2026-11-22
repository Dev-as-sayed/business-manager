import type { Metadata } from "next";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import AboutPage from "@/components/marketing/about/AboutPage";
import { aboutMetadata, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = aboutMetadata;

export default function Page() {
  return (
    <MarketingLayout
      jsonLd={[
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]),
      ]}
    >
      <AboutPage />
    </MarketingLayout>
  );
}
