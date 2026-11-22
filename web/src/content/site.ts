export const site = {
  name: "Omnia",
  tagline: "The brand launcher.",
  description:
    "Omnia is an all-in-one product sourcing, custom development, e-commerce, content, and marketing platform for launching product brands from China.",
  url: "https://omnia.example",
  email: "hello@omnia.example",
  phoneDisplay: "+00 000 000 0000",
  phoneHref: "tel:+000000000000",
  whatsappDisplay: "+00 000 000 0000",
  whatsappHref: "https://wa.me/000000000000",
  addresses: [
    {
      id: "hq",
      label: "Headquarters",
      lines: ["HQ address placeholder", "City, Country"],
      note: "Placeholder address",
    },
    {
      id: "china",
      label: "China office & warehouse",
      lines: ["China address placeholder", "City, Province, China"],
      note: "Placeholder address",
    },
  ],
  hours: [
    {
      label: "China team",
      value: "Mon–Fri, 9:00–18:00 CST (UTC+8)",
      note: "Placeholder hours",
    },
    {
      label: "Client success",
      value: "Mon–Fri, 9:00–18:00 [HQ timezone]",
      note: "Placeholder hours",
    },
  ],
  social: [
    { label: "Instagram", href: "#", icon: "instagram" },
    { label: "LinkedIn", href: "#", icon: "linkedin" },
    { label: "YouTube", href: "#", icon: "youtube" },
    { label: "X", href: "#", icon: "x" },
  ],
} as const;

export const ctaLinks = {
  start: "/contact?project=full-launch#project-form",
  quote: "/contact?project=sourcing#project-form",
  consultation: "/contact#book",
  store: "/contact?project=website#project-form",
  development: "/contact?project=custom-product#project-form",
  services: "/services",
  contact: "/contact#project-form",
} as const;

export const projectTypeValues = [
  "sourcing",
  "custom-product",
  "website",
  "full-launch",
] as const;

export type ProjectType = (typeof projectTypeValues)[number];
