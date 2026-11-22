import type { Metadata } from "next";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import LegalPage from "@/components/marketing/LegalPage";
import { termsMetadata } from "@/lib/seo";

export const metadata: Metadata = termsMetadata;

const sections = [
  {
    heading: "Services",
    body: [
      "Placeholder — describe the scope of sourcing, product development, software, content, and marketing services.",
    ],
  },
  {
    heading: "Quotes, payments, and refunds",
    body: [
      "Placeholder — explain how quotes are issued, payment milestones, and the refund policy.",
    ],
    id: "refund",
  },
  {
    heading: "Shipping, customs, and timelines",
    body: [
      "Placeholder — describe shipping terms, customs responsibilities, and estimated timelines.",
    ],
  },
  {
    heading: "Intellectual property",
    body: [
      "Placeholder — describe ownership of designs, content, software, and brand assets.",
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "Placeholder — add the legal limitations and dispute-resolution terms reviewed by counsel.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Placeholder — add the legal entity name, registered address, and contract contact email.",
    ],
  },
];

export default function TermsPage() {
  return (
    <MarketingLayout>
      <LegalPage
        title="Terms of Service"
        description="The terms that apply to The Brand Launcher services."
        sections={sections}
      />
    </MarketingLayout>
  );
}
