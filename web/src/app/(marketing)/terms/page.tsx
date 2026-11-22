import type { Metadata } from "next";
import { Container } from "@/components/marketing/ui/Container";

export const metadata: Metadata = {
  title: {
    absolute: "Omnia | Terms of Service",
  },
  description: "Terms of service for Omnia platform.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Omnia | Terms of Service",
    description: "Terms of service for Omnia platform.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <section className="min-h-screen bg-paper text-ink">
      <Container className="py-24 sm:py-32 lg:py-36">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.035em] text-ink mb-8">Terms of Service</h1>

          <div className="space-y-6 text-sm">
            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">1. Acceptance of Terms</h2>
            <p>
              These terms constitute a legal agreement between you ("user," "you," or "your") and Omnia ("we," "us," or "our") regarding access to and use of the website, platform, and services offered by Omnia.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">2. Use of Service</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>
                You must be at least 18 years old to use our services.
              </li>
              <li>
                You agree to provide accurate, current, and complete information during the registration process.
              </li>
              <li>
                You are responsible for maintaining the security of your account and password.
              </li>
            </ul>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">3. Service Description</h2>
            <p>
              Omnia provides product sourcing, custom product development, e-commerce website development, media content creation, and marketing services to help entrepreneurs launch product brands from China.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">4. Intellectual Property</h2>
            <p>
              All content, trademarks, service marks, logos, and other proprietary information displayed on the platform are the property of Omnia or its licensors and are protected by intellectual property laws.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">5. Limitation of Liability</h2>
            <p>
              Omnia shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, or other intangible losses, resulting from your use of the service.
            </p>

            <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-ink mb-4">6. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction where Omnia operates, without regard to its conflict of law provisions.
            </p>
          </div>

          <div className="mt-8 p-6 rounded-2xl border border-line bg-surface">
            <p className="text-xs text-ink-muted">
              Last updated: August 2026. Omnia reserves the right to modify these terms at any time.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}