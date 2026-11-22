import type { Metadata } from "next";
import { Container } from "@/components/marketing/ui/Container";

export const metadata: Metadata = {
  title: {
    absolute: "Omnia | Privacy Policy",
  },
  description: "Privacy policy for Omnia platform.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Omnia | Privacy Policy",
    description: "Privacy policy for Omnia platform.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <section className="min-h-screen bg-paper text-ink">
      <Container className="py-24 sm:py-32 lg:py-36">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.035em] text-ink mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-sm">
            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">1. Information We Collect</h2>
            <p>
              Omnia collects information that you voluntarily provide when using our services, including but not limited to: name, email address, phone number, project details, and business information.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to operate our platform, respond to your inquiries, provide our services, send administrative emails, and improve our offerings.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">3. Data Sharing</h2>
            <p>
              We may share your information with trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">4. International Data Transfers</h2>
            <p>
              Since we operate globally, including having teams in China, your information may be transferred to and processed in jurisdictions outside your country of residence. We ensure appropriate safeguards are in place.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. You may also request restriction on processing or data portability. Please contact us to exercise these rights.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">6. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">7. Cookies</h2>
            <p>
              Our website uses cookies to enhance your browsing experience. You can choose to accept or decline cookies through your browser settings.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">8. Changes to this Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </div>

          <div className="mt-8 p-6 rounded-2xl border border-line bg-surface">
            <p className="text-xs text-ink-muted">
              Last updated: August 2026. Omnia reserves the right to modify this privacy policy at any time.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}