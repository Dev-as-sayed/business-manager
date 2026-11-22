export const oldWay = [
  "Separate agents, designers, developers, shippers, and marketers",
  "Quotes that change after the deposit",
  "Weeks lost to translation and time-zone gaps",
  "Samples that don't match the final order",
  "Five dashboards and no single owner",
];

export const omniaWay = [
  "One team across sourcing, development, software, content, and marketing",
  "A transparent cost breakdown before you commit",
  "A bilingual team on the ground in China",
  "Sample approval and inspection before mass production",
  "One timeline and one dashboard from idea to launch",
];

export const howItWorks = [
  {
    title: "Idea or product choice",
    you: "Share your idea, reference product, or existing product.",
    we: "Review feasibility, costs, and the fastest route to market.",
  },
  {
    title: "Sourcing or development",
    you: "Approve the factory, design direction, and sample.",
    we: "Vet suppliers, negotiate, design, prototype, and inspect.",
  },
  {
    title: "Store setup",
    you: "Pick your store name and brand look.",
    we: "Build and configure your store, products, payments, and shipping.",
  },
  {
    title: "Content and marketing",
    you: "Approve the content and campaign plan.",
    we: "Shoot content, set up channels, and launch campaigns.",
  },
  {
    title: "Launch, shipping, and sales",
    you: "Start selling and talk to your customers.",
    we: "Ship door-to-door, monitor orders, and support growth.",
  },
];

export const bridgePoints = [
  "Factory vetting and negotiation",
  "Sample checks and pre-shipment inspections",
  "Order consolidation under one roof",
  "Door-to-door shipping with clear tracking",
  "Bilingual updates across time zones",
  "One account manager for the whole launch",
];

export const stats = [
  { label: "Brands launched", value: "XX", note: "Placeholder metric" },
  { label: "Factories vetted", value: "XX", note: "Placeholder metric" },
  { label: "Orders shipped", value: "XX", note: "Placeholder metric" },
  { label: "Countries served", value: "XX", note: "Placeholder metric" },
];

export type SoftwareTabId =
  | "storefront"
  | "orders"
  | "inventory"
  | "crm"
  | "analytics";

export const softwareTabs: {
  id: SoftwareTabId;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    id: "storefront",
    label: "Storefront",
    title: "A store that looks like your brand.",
    description:
      "Start from a conversion-ready layout, then customize colors, type, products, and pages without code.",
  },
  {
    id: "orders",
    label: "Orders",
    title: "Every order in one queue.",
    description:
      "Track payment, fulfillment, and delivery status without chasing spreadsheets or chat threads.",
  },
  {
    id: "inventory",
    label: "Inventory",
    title: "Know what is left before you sell out.",
    description:
      "See stock by product and variant, set low-stock alerts, and plan your next production run.",
  },
  {
    id: "crm",
    label: "CRM",
    title: "Turn buyers into repeat customers.",
    description:
      "Keep customer history, conversations, and pipeline stages together so follow-up is simple.",
  },
  {
    id: "analytics",
    label: "Analytics",
    title: "See what is actually driving sales.",
    description:
      "Revenue, sessions, conversion, and top products in a dashboard you can read at a glance.",
  },
];

export const stories = [
  {
    brand: "Harbor & Pine",
    category: "Home & living",
    tags: ["Sourced", "Website", "Content"],
    whatWeDid:
      "Sourced a small-batch homeware line, built the storefront, and produced the launch content.",
    image: "/placeholders/story-home.png",
    alt: "Placeholder product composition for a home and living brand",
  },
  {
    brand: "Noma Ritual",
    category: "Wellness",
    tags: ["Developed", "Sourced", "Content", "Marketing"],
    whatWeDid:
      "Developed a custom wellness product, sourced packaging, and built the launch campaign.",
    image: "/placeholders/story-wellness.png",
    alt: "Placeholder product composition for a wellness brand",
  },
  {
    brand: "Tiny Atlas",
    category: "Travel accessories",
    tags: ["Sourced", "Website", "Marketing"],
    whatWeDid:
      "Consolidated a travel accessory range, launched the store, and set up paid social.",
    image: "/placeholders/story-travel.png",
    alt: "Placeholder product composition for a travel accessories brand",
  },
];

export const pricingRows = [
  {
    label: "Service package",
    detail: "Sourcing, development, store, content, and marketing scoped upfront.",
    tag: "Quoted upfront",
  },
  {
    label: "Factory product cost",
    detail: "The manufacturer's invoice for your order.",
    tag: "At cost",
  },
  {
    label: "Freight, duties, and taxes",
    detail: "Passed through at the carrier and customs rate.",
    tag: "At cost",
  },
  {
    label: "Our sourcing fee",
    detail: "A clear percentage or flat fee, agreed before you order.",
    tag: "Quoted upfront",
  },
];

export const personas = [
  {
    title: "First-time entrepreneur",
    description:
      "You have an idea and the drive, but no supplier network or technical team.",
    outcome: "A launch-ready brand without hiring five vendors.",
    points: [
      "Product feasibility and sourcing",
      "Store and content done for you",
      "One team to ask questions",
    ],
  },
  {
    title: "Small business going online",
    description:
      "You already sell locally or wholesale and want a branded online store.",
    outcome: "A branded store that sells while you run the shop.",
    points: [
      "Product line expansion",
      "Store migration and setup",
      "Content and marketing support",
    ],
  },
  {
    title: "Creator or influencer",
    description:
      "You have an audience and want to launch a product that fits your brand.",
    outcome: "A product your audience can buy, not just another shoutout.",
    points: [
      "Custom product development",
      "Brand-ready content",
      "Launch campaigns to your audience",
    ],
  },
];
