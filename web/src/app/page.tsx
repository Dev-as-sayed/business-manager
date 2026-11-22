import type { Metadata } from "next";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import HomePage from "@/components/marketing/HomePage";
import { faqJsonLd, homeMetadata } from "@/lib/seo";

export const metadata: Metadata = homeMetadata;

export default function Page() {
  return (
    <MarketingLayout jsonLd={[faqJsonLd()]}>
      <HomePage />
    </MarketingLayout>
  );
}
