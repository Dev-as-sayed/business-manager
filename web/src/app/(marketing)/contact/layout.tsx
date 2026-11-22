import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute:
      "Contact Omnia | Get a Free Product Quote or Consultation",
  },
  description:
    "Contact Omnia — get a free product quote or book a free consultation. We reply within 24 hours.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title:
      "Contact Omnia | Get a Free Product Quote or Consultation",
    description:
      "Get in touch with our team. We reply within 24 hours to discuss your brand idea.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
