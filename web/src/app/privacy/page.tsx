import type { Metadata } from "next";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import LegalPage from "@/components/marketing/LegalPage";
import { privacyMetadata } from "@/lib/seo";

export const metadata: Metadata = privacyMetadata;

const sections = [
  {
    heading: "Information we collect",
    body: [
      "Placeholder — describe the information collected through the contact form, newsletter, analytics, and cookies.",
    ],
  },
  {
    heading: "How we use information",
    body: [
      "Placeholder — explain how enquiries, quotes, and project information are used to respond and deliver services.",
    ],
  },
  {
    heading: "Sharing and processors",
    body: [
      "Placeholder — list the categories of service providers used for hosting, email, payments, and analytics.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Placeholder — describe access, correction, deletion, and opt-out rights, plus how to exercise them.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Placeholder — add the legal entity name, registered address, and privacy contact email.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <LegalPage
        title="Privacy Policy"
        description="How The Brand Launcher handles your information."
        sections={sections}
      />
    </MarketingLayout>
  );
}
