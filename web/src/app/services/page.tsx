import type { Metadata } from "next";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import ServicesPage from "@/components/marketing/services/ServicesPage";
import {
  breadcrumbJsonLd,
  servicesFaqJsonLd,
  servicesJsonLd,
  servicesMetadata,
} from "@/lib/seo";

export const metadata: Metadata = servicesMetadata;

export default function Page() {
  return (
    <MarketingLayout
      jsonLd={[
        servicesJsonLd(),
        servicesFaqJsonLd(),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]),
      ]}
    >
      <ServicesPage />
    </MarketingLayout>
  );
}
