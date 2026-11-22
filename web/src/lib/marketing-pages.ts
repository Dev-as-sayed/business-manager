import type { IconKey } from "@/lib/marketing-content";

export type ServiceSlug =
  | "sourcing"
  | "development"
  | "software"
  | "content"
  | "marketing";

/* -------------------------------------------------------------------------- */
/*  ABOUT                                                                      */
/* -------------------------------------------------------------------------- */

export const aboutContent = {
  hero: {
    eyebrow: "About The Brand Launcher",
    title: "We Built the Bridge Between Your Idea and the Factory Floor.",
    description:
      "One team in China and one platform for sourcing, product development, e-commerce, content, and marketing — so founders can launch without juggling vendors.",
    trust: ["One team", "One timeline", "One dashboard"],
    images: [
      { label: "China team on the ground", hint: "Placeholder image" },
      { label: "Founder launching a store", hint: "Placeholder image" },
    ],
  },
  story: {
    eyebrow: "Our story",
    title: "It Started With a Simple Frustration.",
    paragraphs: [
      "Too many good product ideas die in the gap between a factory, a freelancer, and a shipping agent. Founders spend months coordinating vendors who never speak to each other.",
      "The Brand Launcher was built to close that gap: a team on the ground in China, a product development process, a store, content, and marketing — connected under one roof.",
      "[Placeholder founder story — replace with the real origin story, names, and dates.]",
    ],
    quote:
      "We did not want to be another middleman. We wanted to be the team that actually makes the launch happen.",
    quoteAttribution: "Founder — placeholder",
    placeholder: true,
  },
  problemsFixes: [
    {
      problem: "Unreliable suppliers",
      fix: "We vet factories and inspect quality on the ground.",
    },
    {
      problem: "Language and communication gaps",
      fix: "A bilingual team and clear documentation at every step.",
    },
    {
      problem: "Hidden fees",
      fix: "Transparent cost breakdowns before you commit.",
    },
    {
      problem: "Shipping delays",
      fix: "Consolidation, tracking, and door-to-door delivery.",
    },
    {
      problem: "Scattered vendors",
      fix: "One team, one timeline, one dashboard.",
    },
    {
      problem: "No technical skills",
      fix: "Done-for-you store, software, and content.",
    },
  ],
  missionVision: {
    mission:
      "Make launching a product brand possible for anyone with a good idea.",
    vision:
      "A world where founders can go from idea to first sale without needing a factory contact or a technical co-founder.",
  },
  values: [
    {
      icon: "eye" as IconKey,
      title: "Transparency",
      description: "Clear costs, clear timelines, no surprises.",
    },
    {
      icon: "award" as IconKey,
      title: "Quality First",
      description: "We inspect before we ship.",
    },
    {
      icon: "zap" as IconKey,
      title: "Speed",
      description: "Momentum matters. We keep launches moving.",
    },
    {
      icon: "users" as IconKey,
      title: "Partnership",
      description: "We win when your brand sells.",
    },
    {
      icon: "globe" as IconKey,
      title: "Accessibility",
      description: "No technical skills or supplier network required.",
    },
  ],
  teamGroups: [
    {
      title: "Sourcing & Quality",
      members: [
        {
          name: "Team member 01",
          role: "Sourcing & Quality Lead",
          bio: "Short bio placeholder — add real team details here.",
        },
        {
          name: "Team member 02",
          role: "Quality Inspector",
          bio: "Short bio placeholder — add real team details here.",
        },
      ],
    },
    {
      title: "Product Development",
      members: [
        {
          name: "Team member 03",
          role: "Product Development Lead",
          bio: "Short bio placeholder — add real team details here.",
        },
        {
          name: "Team member 04",
          role: "Industrial Designer",
          bio: "Short bio placeholder — add real team details here.",
        },
      ],
    },
    {
      title: "Software & Design",
      members: [
        {
          name: "Team member 05",
          role: "Software Lead",
          bio: "Short bio placeholder — add real team details here.",
        },
        {
          name: "Team member 06",
          role: "Brand Designer",
          bio: "Short bio placeholder — add real team details here.",
        },
      ],
    },
    {
      title: "Content & Marketing",
      members: [
        {
          name: "Team member 07",
          role: "Content Lead",
          bio: "Short bio placeholder — add real team details here.",
        },
        {
          name: "Team member 08",
          role: "Growth Marketer",
          bio: "Short bio placeholder — add real team details here.",
        },
      ],
    },
    {
      title: "Account Management",
      members: [
        {
          name: "Team member 09",
          role: "Account Manager",
          bio: "Short bio placeholder — add real team details here.",
        },
      ],
    },
  ],
  promises: [
    {
      title: "Transparent pricing",
      description: "You see the cost breakdown before you commit.",
    },
    {
      title: "Sample before mass production",
      description: "Nothing goes into production until you approve the sample.",
    },
    {
      title: "Inspection before shipping",
      description: "We check quality before your order leaves the factory.",
    },
    {
      title: "Dedicated account manager",
      description: "One point of contact who knows your project.",
    },
    {
      title: "Regular updates",
      description: "Clear progress updates instead of silence.",
    },
  ],
  trustItems: [
    {
      icon: "file" as IconKey,
      title: "Business registration",
      description: "Placeholder — add registration details.",
    },
    {
      icon: "shield" as IconKey,
      title: "Certifications",
      description: "Placeholder — add certifications.",
    },
    {
      icon: "layers" as IconKey,
      title: "Partner factories",
      description: "Placeholder — add partner factory logos.",
    },
    {
      icon: "truck" as IconKey,
      title: "Payment protection",
      description: "Placeholder — add payment protection details.",
    },
  ],
  testimonials: [
    {
      quote:
        "Placeholder testimonial — replace with a real client quote about sourcing and launch support.",
      author: "Client name — placeholder",
      company: "Sample brand — placeholder",
    },
    {
      quote:
        "Placeholder testimonial — replace with a real client quote about product development.",
      author: "Client name — placeholder",
      company: "Sample brand — placeholder",
    },
    {
      quote:
        "Placeholder testimonial — replace with a real client quote about store, content, or marketing.",
      author: "Client name — placeholder",
      company: "Sample brand — placeholder",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  SERVICES                                                                   */
/* -------------------------------------------------------------------------- */

export const servicesPageContent = {
  hero: {
    eyebrow: "Services",
    title: "Everything Your Brand Needs. One Team.",
    description:
      "Five connected services that take you from product idea to a selling brand — without juggling separate suppliers, designers, developers, and marketers.",
  },
  services: [
    {
      slug: "sourcing" as ServiceSlug,
      icon: "package" as IconKey,
      title: "Product Sourcing",
      headline: "Product Sourcing, Without the Guesswork.",
      description:
        "We find and vet Chinese manufacturers, negotiate prices, order samples, run quality checks, consolidate, and ship door-to-door.",
      includes: [
        "Manufacturer vetting and verification",
        "Price negotiation",
        "Sample ordering",
        "Quality inspection",
        "Consolidation and warehousing",
        "Air, sea, and express shipping",
        "Transparent cost breakdown",
      ],
      steps: [
        "Share your product brief",
        "We shortlist and vet factories",
        "Samples are ordered and reviewed",
        "Quality checks before production",
        "Production and consolidation",
        "Door-to-door shipping",
      ],
      whoFor: "Founders who know the product but not the supplier.",
      cta: { label: "Request a Quote", href: "/contact?intent=sourcing" },
      visual: "sourcing" as const,
    },
    {
      slug: "development" as ServiceSlug,
      icon: "tool" as IconKey,
      title: "Custom Product Development",
      headline: "Turn a Sketch Into a Shelf-Ready Product.",
      description:
        "Our factory partners handle design, prototyping, samples, tooling, mass production, and branded packaging.",
      includes: [
        "Product design and 3D modeling",
        "Prototype development",
        "Sample rounds and approval",
        "Tooling and mass production",
        "Branded packaging",
        "Factory quality checks",
      ],
      steps: [
        "Share a sketch or reference",
        "We create the 3D design",
        "A prototype is built",
        "You approve the final sample",
        "Mass production begins",
        "Branded packaging and prep",
      ],
      whoFor: "Founders with an idea but no technical drawings.",
      cta: {
        label: "Turn My Idea Into a Product",
        href: "/contact?intent=development",
      },
      visual: "development" as const,
    },
    {
      slug: "software" as ServiceSlug,
      icon: "monitor" as IconKey,
      title: "E-commerce Website & Software",
      headline: "Launch a Store and Run It From One Dashboard.",
      description:
        "An AI website builder plus orders, inventory, CRM, analytics, and a mobile app — connected in one system.",
      includes: [
        "AI website builder",
        "Visual editor",
        "Subdomain or custom domain",
        "Orders and fulfilment",
        "Inventory management",
        "CRM and customer pipeline",
        "Sales analytics",
        "Mobile app",
      ],
      steps: [
        "Share your brand and products",
        "We build and configure the store",
        "Connect products and payments",
        "Launch your storefront",
        "Manage orders and growth",
      ],
      whoFor: "Founders who need a store without hiring a developer.",
      cta: { label: "Build My Store", href: "/contact?intent=software" },
      visual: "software" as const,
    },
    {
      slug: "content" as ServiceSlug,
      icon: "camera" as IconKey,
      title: "Media Content",
      headline: "Content That Makes Your Product Look Premium.",
      description:
        "Product photos, video, ad creatives, brand visuals, and social content — produced by a team that knows the product.",
      includes: [
        "Product photography",
        "Short-form video",
        "Ad creatives",
        "Brand visuals",
        "Social content packs",
        "Before/after creative direction",
      ],
      steps: [
        "Share the product and goals",
        "We build a shot list",
        "Production and editing",
        "You review and request revisions",
        "Final assets are delivered",
      ],
      whoFor: "Brands that need launch-ready creative.",
      cta: {
        label: "Get a Content Quote",
        href: "/contact?intent=content",
      },
      visual: "content" as const,
    },
    {
      slug: "marketing" as ServiceSlug,
      icon: "trending" as IconKey,
      title: "Marketing & Growth",
      headline: "Turn Attention Into Orders.",
      description:
        "SEO, social media, paid ads, email/WhatsApp campaigns, and ongoing growth support.",
      includes: [
        "SEO",
        "Social media management",
        "Paid ads",
        "Email and WhatsApp campaigns",
        "Reporting",
        "Ongoing growth support",
      ],
      steps: [
        "Audit your current funnel",
        "Build the growth plan",
        "Launch campaigns",
        "Optimize what works",
        "Report and iterate",
      ],
      whoFor: "Brands ready to scale beyond launch.",
      cta: { label: "Grow My Brand", href: "/contact?intent=marketing" },
      visual: "marketing" as const,
    },
  ],
  launchPackages: [
    {
      name: "Starter",
      description: "For testing a product idea with a lean launch.",
      includes: [
        "Product sourcing guidance",
        "AI website setup",
        "Launch content starter pack",
      ],
      featured: false,
    },
    {
      name: "Growth",
      description: "For founders ready to launch and start selling.",
      includes: [
        "Sourcing or product development",
        "Full storefront and CRM setup",
        "Content pack + marketing launch",
      ],
      featured: true,
    },
    {
      name: "Scale",
      description: "For brands scaling products and paid growth.",
      includes: [
        "Multi-product sourcing and development",
        "Advanced store and analytics setup",
        "Ongoing content and marketing support",
      ],
      featured: false,
    },
  ],
  journeySteps: [
    {
      title: "Idea or product choice",
      service: "Start",
      description: "You share the idea, product, or reference.",
    },
    {
      title: "Sourcing or development",
      service: "Sourcing / Development",
      description: "We source or build the product and run quality checks.",
    },
    {
      title: "Store setup",
      service: "Website & Software",
      description: "We build and configure your storefront and dashboard.",
    },
    {
      title: "Content production",
      service: "Content",
      description: "We produce the photos, video, and social assets.",
    },
    {
      title: "Marketing launch",
      service: "Marketing",
      description: "We launch campaigns to bring the first customers.",
    },
    {
      title: "First delivered order",
      service: "Fulfilment",
      description: "We ship door-to-door and help you manage sales.",
    },
  ],
  faqGroups: [
    {
      title: "Product Sourcing",
      faqs: [
        {
          question: "What is the minimum order quantity?",
          answer:
            "It depends on the product and factory. Many items start at a few hundred units, and we always confirm the MOQ before you commit.",
        },
        {
          question: "Can I order samples before placing a bulk order?",
          answer:
            "Yes. Samples are part of the sourcing process. We coordinate sample orders and review them against your specifications.",
        },
        {
          question: "How do you check quality?",
          answer:
            "We inspect against the agreed specifications before production and before shipping. The exact inspection plan is confirmed in your quote.",
        },
      ],
    },
    {
      title: "Custom Product Development",
      faqs: [
        {
          question: "How long does development take?",
          answer:
            "A typical development cycle runs several weeks to a few months, depending on design complexity, tooling, and sample rounds. You approve every stage.",
        },
        {
          question: "Who owns the product design?",
          answer:
            "You do. We keep your designs, files, and brand assets confidential and work with factories under clear agreements.",
        },
        {
          question: "What if I need revisions?",
          answer:
            "Sample rounds exist to catch issues before mass production. We iterate with the factory until you approve the final sample.",
        },
      ],
    },
    {
      title: "E-commerce Website & Software",
      faqs: [
        {
          question: "Can I use my own domain?",
          answer:
            "Yes. The store can run on a subdomain or a custom domain, depending on your setup.",
        },
        {
          question: "Do I need technical skills?",
          answer:
            "No. The website builder and dashboard are designed for founders, and we configure the initial setup for you.",
        },
        {
          question: "Is there a mobile app?",
          answer:
            "Yes. The platform includes a mobile app for managing orders, inventory, customers, and sales on the go.",
        },
      ],
    },
    {
      title: "Media Content",
      faqs: [
        {
          question: "What is the turnaround time?",
          answer:
            "Turnaround depends on the content type and volume. We confirm the timeline in your quote before production starts.",
        },
        {
          question: "How many revisions are included?",
          answer:
            "Revision rounds are agreed per project. We review the creative with you before final delivery.",
        },
        {
          question: "Can I use the content in paid ads?",
          answer:
            "Yes. Content is produced for your brand and can be used across your store, social channels, and campaigns.",
        },
      ],
    },
    {
      title: "Marketing & Growth",
      faqs: [
        {
          question: "Is there a minimum ad spend?",
          answer:
            "Ad spend is separate from our service fee and depends on your goals and market. We confirm a recommended range in your plan.",
        },
        {
          question: "How do you report results?",
          answer:
            "You receive regular reporting on traffic, orders, and campaign performance, with clear next steps.",
        },
        {
          question: "Do you work on a monthly retainer?",
          answer:
            "Growth support can be scoped as a project or an ongoing engagement. We will recommend the right model for your stage.",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  CONTACT                                                                    */
/* -------------------------------------------------------------------------- */

export const contactPageContent = {
  hero: {
    eyebrow: "Contact",
    title: "Let's Talk About Your Brand.",
    description: "Tell us what you are building. We reply within 24 hours.",
    trust: ["No obligation", "Free product quote", "One team"],
  },
  projectTypes: [
    "Product sourcing",
    "Custom product development",
    "E-commerce website",
    "Full brand launch",
    "Not sure yet",
  ],
  budgetRanges: [
    "Under $1,000",
    "$1,000 – $5,000",
    "$5,000 – $15,000",
    "$15,000+",
    "Not sure yet",
  ],
  serviceOptions: [
    "Product Sourcing",
    "Custom Product Development",
    "Website & Software",
    "Media Content",
    "Marketing & Growth",
    "Full launch",
  ],
  nextSteps: [
    {
      title: "We review your message",
      description:
        "We read your goals, product, and timeline, and ask any clarifying questions.",
    },
    {
      title: "We send a plan and quote",
      description:
        "You get a clear scope, timeline, and cost breakdown — no hidden fees.",
    },
    {
      title: "We start your project",
      description:
        "Once you approve, we assign your team and begin the launch.",
    },
  ],
  locations: [
    {
      label: "China office",
      value: "Placeholder — China office address",
      note: "Sourcing, development, and quality team",
    },
    {
      label: "China warehouse",
      value: "Placeholder — China warehouse address",
      note: "Consolidation and shipping",
    },
    {
      label: "HQ",
      value: "Placeholder — HQ address",
      note: "Account management and growth",
    },
  ],
  workingHours: [
    "Monday–Friday, 9:00–18:00 China Standard Time (UTC+8)",
    "We reply within 24 hours on business days.",
  ],
  faqs: [
    {
      question: "How quickly do you reply?",
      answer:
        "We aim to reply within 24 hours on business days. If your project is urgent, mention it in your message.",
    },
    {
      question: "Do I need a finished product idea?",
      answer:
        "No. A sketch, reference, or product link is enough to start. We can help shape the idea during the first conversation.",
    },
    {
      question: "What should I prepare?",
      answer:
        "Your goal, target market, budget range, timeline, and any references or sketches. The more context you share, the faster we can respond with a useful plan.",
    },
    {
      question: "Is there a minimum project size?",
      answer:
        "We scope projects individually. Tell us what you need and we will recommend a starting point that fits your stage.",
    },
  ],
  bookingSlots: [
    "Mon 10:00",
    "Mon 14:00",
    "Tue 10:00",
    "Tue 15:00",
    "Wed 11:00",
    "Thu 10:00",
    "Thu 16:00",
    "Fri 09:30",
  ],
};
