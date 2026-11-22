import type { Metadata } from "next";
import { faqs } from "@/lib/marketing-content";
import { contactPageContent, servicesPageContent } from "@/lib/marketing-pages";

export const siteUrl = "https://omnia.amsayed.store";

type Faq = { question: string; answer: string };

function buildMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image: string;
}): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: {
        en: path,
        ar: path,
        zh: path,
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "The Brand Launcher",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "The Brand Launcher — from product idea to profitable brand",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const homeMetadata = buildMetadata({
  title:
    "The Brand Launcher | Source, Create & Launch Your Product Brand From China",
  description:
    "Factory-direct sourcing, custom product development, e-commerce website, content and marketing in one place. Launch your brand with door-to-door shipping.",
  path: "/",
  image: "/og-home.png",
});

export const aboutMetadata = buildMetadata({
  title:
    "About The Brand Launcher | Your Product Sourcing & Brand Launch Team in China",
  description:
    "Meet the team behind The Brand Launcher. We connect founders with Chinese factories for sourcing, product development, e-commerce, content, and marketing.",
  path: "/about",
  image: "/og-about.png",
});

export const servicesMetadata = buildMetadata({
  title:
    "Services | Product Sourcing, Custom Development, E-commerce Website, Content & Marketing",
  description:
    "Explore five connected services: sourcing, custom product development, e-commerce website and software, content, and marketing. One team from idea to first sale.",
  path: "/services",
  image: "/og-services.png",
});

export const contactMetadata = buildMetadata({
  title:
    "Contact The Brand Launcher | Get a Free Product Quote or Consultation",
  description:
    "Tell us about your product idea and get a free quote. Contact The Brand Launcher for sourcing, product development, website, content, and marketing support.",
  path: "/contact",
  image: "/og-contact.png",
});

export const privacyMetadata = buildMetadata({
  title: "Privacy Policy | The Brand Launcher",
  description:
    "Privacy policy placeholder for The Brand Launcher. Add the final legal copy before launch.",
  path: "/privacy",
  image: "/og-home.png",
});

export const termsMetadata = buildMetadata({
  title: "Terms of Service | The Brand Launcher",
  description:
    "Terms of service placeholder for The Brand Launcher. Add the final legal copy before launch.",
  path: "/terms",
  image: "/og-home.png",
});

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Brand Launcher",
    url: siteUrl,
    logo: `${siteUrl}/og-home.png`,
    description:
      "Factory-direct sourcing, custom product development, e-commerce website, content and marketing in one place.",
    areaServed: "Worldwide",
    sameAs: [] as string[],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: "hello@omnia.amsayed.store",
        availableLanguage: ["English", "Arabic", "Chinese"],
      },
    ],
  };
}

export function faqJsonLd(items: Faq[] = faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function servicesFaqJsonLd() {
  return faqJsonLd(
    servicesPageContent.faqGroups.flatMap((group) => group.faqs),
  );
}

export function contactFaqJsonLd() {
  return faqJsonLd(contactPageContent.faqs);
}

export function servicesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The Brand Launcher services",
    itemListElement: servicesPageContent.services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.description,
        url: `${siteUrl}/services#${service.slug}`,
        areaServed: "Worldwide",
        provider: {
          "@type": "Organization",
          name: "The Brand Launcher",
          url: siteUrl,
        },
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
