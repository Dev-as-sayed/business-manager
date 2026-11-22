// Single source of truth for all Home page copy and data.
// Placeholder values are marked with `placeholder: true` so they are easy to find.

export type IconKey =
  | "package"
  | "tool"
  | "monitor"
  | "camera"
  | "trending"
  | "globe"
  | "truck"
  | "shield"
  | "users"
  | "smartphone"
  | "chart"
  | "layers"
  | "zap"
  | "target"
  | "edit"
  | "cpu"
  | "award"
  | "repeat"
  | "file"
  | "eye";

export const primaryCta = {
  label: "Start Your Brand",
  href: "/contact?intent=start",
};

export const secondaryCta = {
  label: "Get a Free Product Quote",
  href: "/contact?intent=quote",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const servicesNav = [
  { label: "Product Sourcing", href: "/services#sourcing" },
  { label: "Custom Product Development", href: "/services#development" },
  { label: "E-commerce Website & Software", href: "/services#software" },
  { label: "Media Content", href: "/services#content" },
  { label: "Marketing & Growth", href: "/services#marketing" },
];

export const trustPoints = [
  "Door-to-door shipping",
  "Factory-direct prices",
  "One team, one platform",
];

export const flowSteps = [
  "Idea",
  "Factory",
  "Product",
  "Website",
  "Content",
  "Customer",
];

export const problems = [
  "Separate factory agents and sourcing middlemen",
  "Freelance designers and developers",
  "Shipping companies with hidden fees",
  "Marketers who never see the product",
  "Five timelines that never line up",
];

export const solutions = [
  "One team from idea to first sale",
  "Factory-direct sourcing and development",
  "Door-to-door shipping handled for you",
  "Content and marketing that know the product",
  "One timeline and one dashboard",
];

export const services: {
  id: string;
  href: string;
  icon: IconKey;
  title: string;
  benefit: string;
  bullets: string[];
  featured?: boolean;
}[] = [
  {
    id: "sourcing",
    href: "/services#sourcing",
    icon: "package",
    title: "Product Sourcing",
    benefit: "Factory-direct products, vetted and shipped.",
    bullets: [
      "Manufacturer vetting and price negotiation",
      "Sample ordering and quality checks",
      "Consolidation and door-to-door shipping",
    ],
    featured: true,
  },
  {
    id: "development",
    href: "/services#development",
    icon: "tool",
    title: "Custom Product Development",
    benefit: "Your idea, engineered into a real product.",
    bullets: [
      "Design, 3D modeling, and prototyping",
      "Sample approval before mass production",
      "Branding, packaging, and factory production",
    ],
    featured: true,
  },
  {
    id: "software",
    href: "/services#software",
    icon: "monitor",
    title: "E-commerce Website & Software",
    benefit: "Launch a store and run it from one dashboard.",
    bullets: [
      "AI website builder and storefront",
      "Orders, inventory, customers, and CRM",
      "Sales analytics and mobile app",
    ],
  },
  {
    id: "content",
    href: "/services#content",
    icon: "camera",
    title: "Media Content",
    benefit: "Content that makes your product look premium.",
    bullets: [
      "Product photography and video",
      "Ad creatives and brand visuals",
      "Social-ready content packs",
    ],
  },
  {
    id: "marketing",
    href: "/services#marketing",
    icon: "trending",
    title: "Marketing & Growth",
    benefit: "Turn attention into orders.",
    bullets: [
      "SEO and social media management",
      "Paid ads and email/WhatsApp campaigns",
      "Ongoing growth support",
    ],
  },
];

export const steps: {
  title: string;
  you: string;
  we: string;
}[] = [
  {
    title: "Idea or product choice",
    you: "Share your idea, product, or reference.",
    we: "Assess feasibility and send a clear quote.",
  },
  {
    title: "Sourcing or development",
    you: "Approve samples and specifications.",
    we: "Source or develop, then run quality checks.",
  },
  {
    title: "Store setup",
    you: "Share your brand details and products.",
    we: "Build and configure your store and dashboard.",
  },
  {
    title: "Content & marketing",
    you: "Approve creative and campaign plans.",
    we: "Produce content and launch campaigns.",
  },
  {
    title: "Launch, shipping & sales",
    you: "Focus on your brand and customers.",
    we: "Ship orders and help manage sales.",
  },
];

export const devSteps = [
  "Sketch",
  "3D design",
  "Prototype",
  "Sample approval",
  "Mass production",
  "Branded packaging",
];

export const chinaHighlights = [
  "Factory vetting and verification",
  "On-site quality inspection",
  "Price negotiation",
  "Consolidation and warehousing",
  "Door-to-door shipping",
];

// Conservative, rounded placeholders.
export const chinaStats = [
  { value: 80, suffix: "+", label: "Factories vetted" },
  { value: 12, suffix: "k+", label: "Products shipped" },
  { value: 25, suffix: "+", label: "Countries served" },
];

export const softwareTabs: {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: IconKey;
}[] = [
  {
    id: "storefront",
    label: "Storefront",
    title: "A store that looks the part",
    description:
      "Launch a polished, mobile-ready storefront with an AI website builder.",
    icon: "monitor",
  },
  {
    id: "orders",
    label: "Orders",
    title: "Every order in one place",
    description:
      "Track new orders, fulfilment status, and shipping from a single queue.",
    icon: "package",
  },
  {
    id: "inventory",
    label: "Inventory",
    title: "Know what you have",
    description:
      "Keep stock levels accurate across products and variants automatically.",
    icon: "layers",
  },
  {
    id: "crm",
    label: "CRM",
    title: "Turn leads into repeat buyers",
    description:
      "Manage customer conversations and deal pipelines without spreadsheets.",
    icon: "users",
  },
  {
    id: "analytics",
    label: "Analytics",
    title: "See what is working",
    description:
      "Understand sales, traffic, and product performance at a glance.",
    icon: "chart",
  },
];

// Conservative placeholder metrics.
export const marketingMetrics = [
  { value: "+120%", label: "Organic traffic" },
  { value: "+40%", label: "Orders" },
  { value: "2.4x", label: "Return on ad spend" },
];

export const contentShowcase = [
  { title: "Product photography", type: "Photo", before: "Raw phone photo", after: "Studio product shot" },
  { title: "Short-form video", type: "Video", before: "Unedited clip", after: "Scroll-stopping edit" },
  { title: "Ad creative", type: "Ad", before: "Plain product image", after: "Performance creative" },
  { title: "Social post", type: "Social", before: "No brand system", after: "On-brand content" },
];

export const stories: {
  brand: string;
  industry: string;
  tags: string[];
  result: string;
  placeholder: boolean;
}[] = [
  {
    brand: "Nova Athletics",
    industry: "Fitness apparel",
    tags: ["Sourced", "Website", "Marketing"],
    result: "Launched in 6 weeks with a full storefront and content library.",
    placeholder: true,
  },
  {
    brand: "Luma Home",
    industry: "Home & decor",
    tags: ["Developed", "Content", "Marketing"],
    result: "Took a sketch to a packaged product and first 500 orders.",
    placeholder: true,
  },
  {
    brand: "Pulse Audio",
    industry: "Consumer electronics",
    tags: ["Sourced", "Website", "Content"],
    result: "Factory-direct sourcing with a 2.4x return on ad spend.",
    placeholder: true,
  },
  {
    brand: "Mira Beauty",
    industry: "Skincare",
    tags: ["Developed", "Website", "Marketing"],
    result: "Built a branded line and a repeat-purchase customer base.",
    placeholder: true,
  },
];

export const pricingTiers = [
  {
    name: "Starter",
    price: "Custom quote",
    priceNote: "tailored to your scope",
    description: "For testing a product idea with a lean launch.",
    features: [
      "Product sourcing guidance",
      "AI website setup",
      "Launch content starter pack",
    ],
    featured: false,
  },
  {
    name: "Growth",
    price: "Custom quote",
    priceNote: "tailored to your scope",
    description: "For founders ready to launch and start selling.",
    features: [
      "Sourcing or product development",
      "Full storefront and CRM setup",
      "Content pack + marketing launch",
    ],
    featured: true,
  },
  {
    name: "Scale",
    price: "Custom quote",
    priceNote: "tailored to your scope",
    description: "For brands scaling products and paid growth.",
    features: [
      "Multi-product sourcing and development",
      "Advanced store and analytics setup",
      "Ongoing content and growth support",
    ],
    featured: false,
  },
];

export const personas = [
  {
    icon: "zap" as IconKey,
    title: "First-time entrepreneur",
    description:
      "You have an idea but no technical skills or supplier connections. We handle the product, store, content, and marketing.",
  },
  {
    icon: "monitor" as IconKey,
    title: "Small business going online",
    description:
      "You already sell locally and want a professional online store, better operations, and a growth plan.",
  },
  {
    icon: "award" as IconKey,
    title: "Creator or influencer",
    description:
      "You have an audience and want to launch merch or a product line that lives up to your brand.",
  },
];

export const faqs = [
  {
    question: "What is the minimum order quantity?",
    answer:
      "It depends on the product and factory. Many items start at a few hundred units, and we always confirm the MOQ before you commit.",
  },
  {
    question: "How long does custom product development take?",
    answer:
      "A typical development cycle runs several weeks to a few months, depending on design complexity, tooling, and sample rounds. You approve every stage.",
  },
  {
    question: "How long is shipping, and who handles customs?",
    answer:
      "Shipping time depends on the method and destination. We coordinate freight, customs documentation, and door-to-door delivery so you do not have to manage it.",
  },
  {
    question: "Who owns the product design?",
    answer:
      "You do. We keep your designs, files, and brand assets confidential and work with factories under clear agreements.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We support common international payment methods and milestone-based payments for development and production. Exact options are confirmed in your quote.",
  },
  {
    question: "What happens if the samples are not good?",
    answer:
      "We iterate. Samples are reviewed against your specifications, and we do not move to mass production until you approve the final sample.",
  },
];

export const footerColumns = [
  {
    title: "Pages",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Product Sourcing", href: "/services#sourcing" },
      { label: "Custom Product Development", href: "/services#development" },
      { label: "Website & Software", href: "/services#software" },
      { label: "Media Content", href: "/services#content" },
      { label: "Marketing & Growth", href: "/services#marketing" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/terms#refund" },
    ],
  },
];

export const locales = [
  { code: "en", label: "English", currency: "USD" },
  { code: "ar", label: "العربية", currency: "AED" },
  { code: "zh", label: "中文", currency: "CNY" },
];

export const contact = {
  email: "hello@omnia.amsayed.store",
  phone: "+00 000 000 0000",
  whatsapp: "+00 000 000 0000",
  whatsappHref: "#",
  chinaOffice: "Placeholder — China office address",
  chinaWarehouse: "Placeholder — China warehouse address",
  hq: "Placeholder — HQ address",
  workingHours: "Mon–Fri, 9:00–18:00 China Standard Time (UTC+8)",
  placeholder: true,
};

export const appLinks = {
  appStore: "#",
  googlePlay: "#",
  placeholder: true,
};

export const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "YouTube", href: "#" },
];
