import type { Metadata } from "next";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import ContactPage from "@/components/marketing/contact/ContactPage";
import {
  breadcrumbJsonLd,
  contactFaqJsonLd,
  contactMetadata,
} from "@/lib/seo";

export const metadata: Metadata = contactMetadata;

export default function Page() {
  return (
    <MarketingLayout
      jsonLd={[
        contactFaqJsonLd(),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]),
      ]}
    >
      <ContactPage />
    </MarketingLayout>
  );
}
