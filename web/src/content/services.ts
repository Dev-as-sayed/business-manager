import { ctaLinks } from "@/content/site";

export type ServiceId =
  | "sourcing"
  | "development"
  | "software"
  | "content"
  | "marketing";

export type Service = {
  id: ServiceId;
  index: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  bullets: string[];
  steps: { title: string; description: string }[];
  whoFor: string;
  ctaLabel: string;
  ctaHref: string;
  cardClass: string;
};

export const services: Service[] = [
  {
    id: "sourcing",
    index: "01",
    name: "Product Sourcing",
    shortName: "Sourcing",
    tagline:
      "Vetted factories, negotiated prices, and quality checks before your money moves.",
    description:
      "You bring the product idea or a reference. We find manufacturers, compare quotes, order samples, inspect quality, consolidate your order, and ship it door-to-door.",
    bullets: [
      "Factory vetting and shortlisting",
      "Price negotiation and MOQ guidance",
      "Sample orders and quality inspections",
      "Consolidation and door-to-door shipping",
    ],
    steps: [
      { title: "Share your brief", description: "Product, target price, and market." },
      { title: "Shortlist factories", description: "Vetted suppliers, compared side by side." },
      { title: "Approve samples", description: "We order, inspect, and document." },
      { title: "Inspect and consolidate", description: "Quality checks before dispatch." },
      { title: "Ship door-to-door", description: "One route from factory to you." },
    ],
    whoFor:
      "You have a product idea or a reference product and need a reliable supplier.",
    ctaLabel: "Request a Quote",
    ctaHref: ctaLinks.quote,
    cardClass: "lg:col-span-3",
  },
  {
    id: "development",
    index: "02",
    name: "Custom Product Development",
    shortName: "Development",
    tagline:
      "From a sketch on paper to a shelf-ready product with your name on it.",
    description:
      "We turn your idea into a manufacturable product: design, 3D renders, prototypes, sample revisions, mass production, and branded packaging.",
    bullets: [
      "Concept and industrial design",
      "3D renders and prototypes",
      "Sample approval and revisions",
      "Mass production and branded packaging",
    ],
    steps: [
      { title: "Sketch or reference", description: "Start with an idea or a product you love." },
      { title: "Design and 3D render", description: "Make it real before tooling." },
      { title: "Prototype and sample", description: "Test materials and details." },
      { title: "Approve the final sample", description: "Sign off against the spec." },
      { title: "Produce and package", description: "Mass production with your branding." },
    ],
    whoFor:
      "You have an idea but no technical drawings, factory contacts, or production experience.",
    ctaLabel: "Turn My Idea Into a Product",
    ctaHref: ctaLinks.development,
    cardClass: "lg:col-span-3",
  },
  {
    id: "software",
    index: "03",
    name: "E-commerce Website & Software",
    shortName: "Software",
    tagline:
      "A store, dashboard, and mobile app that work together from day one.",
    description:
      "Launch a branded store with our AI website builder, then manage orders, inventory, customers, and sales from one dashboard.",
    bullets: [
      "AI website builder and visual editor",
      "Orders, inventory, and CRM",
      "Sales analytics and mobile app",
      "Custom domain and payment setup",
    ],
    steps: [
      { title: "Pick a storefront", description: "Start from a conversion-ready layout." },
      { title: "Customize your brand", description: "Fonts, colors, imagery, and copy." },
      { title: "Add products and payments", description: "Connect your catalog and checkout." },
      { title: "Connect shipping", description: "Set rates and delivery options." },
      { title: "Launch and manage", description: "Run the store from one dashboard." },
    ],
    whoFor:
      "You want to sell online without hiring a developer or stitching together five tools.",
    ctaLabel: "Build My Store",
    ctaHref: ctaLinks.store,
    cardClass: "lg:col-span-2",
  },
  {
    id: "content",
    index: "04",
    name: "Media Content",
    shortName: "Content",
    tagline:
      "Product photos, video, and social content that make your brand look established.",
    description:
      "We plan, shoot, edit, and deliver the visual assets your store and ads need — from product photography to short-form video and social content.",
    bullets: [
      "Product photography and video",
      "Ad creatives and brand visuals",
      "Social content and UGC briefs",
      "Asset library and approvals",
    ],
    steps: [
      { title: "Share your direction", description: "Brand mood, product, and channels." },
      { title: "Plan the shoot", description: "Shot list, styling, and locations." },
      { title: "Capture photos and video", description: "Built for store and ads." },
      { title: "Edit and approve", description: "Review, refine, and sign off." },
      { title: "Publish and reuse", description: "One library across every channel." },
    ],
    whoFor:
      "You need content that looks consistent and premium across your store, ads, and social channels.",
    ctaLabel: "Get a Content Plan",
    ctaHref: ctaLinks.start,
    cardClass: "lg:col-span-2",
  },
  {
    id: "marketing",
    index: "05",
    name: "Marketing & Growth",
    shortName: "Marketing",
    tagline:
      "Traffic, campaigns, and reporting that turn a live store into a growing brand.",
    description:
      "We build and run your growth engine: SEO, social media, paid ads, email and WhatsApp campaigns, and clear reporting.",
    bullets: [
      "SEO and content strategy",
      "Social media management",
      "Paid ads and retargeting",
      "Email and WhatsApp campaigns",
    ],
    steps: [
      { title: "Audit your store", description: "Find the fastest path to sales." },
      { title: "Set the growth plan", description: "Channels, budget, and message." },
      { title: "Launch campaigns", description: "Creative, targeting, and offers." },
      { title: "Optimize weekly", description: "Cut what misses, scale what works." },
      { title: "Report what worked", description: "Clear numbers, no vanity metrics." },
    ],
    whoFor:
      "Your store is live and you need consistent traffic, customers, and repeat sales.",
    ctaLabel: "Grow My Brand",
    ctaHref: ctaLinks.start,
    cardClass: "lg:col-span-2",
  },
];

export const serviceById = Object.fromEntries(
  services.map((service) => [service.id, service]),
) as Record<ServiceId, Service>;

export const serviceOrder: ServiceId[] = [
  "sourcing",
  "development",
  "software",
  "content",
  "marketing",
];
