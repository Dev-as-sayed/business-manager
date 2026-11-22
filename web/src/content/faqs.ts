import type { ServiceId } from "@/content/services";

export type FaqItem = {
  question: string;
  answer: string;
};

export const homeFaqs: FaqItem[] = [
  {
    question: "What is the minimum order quantity?",
    answer:
      "MOQ depends on the product and the factory. We confirm the exact MOQ, tooling costs, and lead time in your free quote before you commit.",
  },
  {
    question: "How long does product development take?",
    answer:
      "It depends on the product's complexity and the number of sample rounds. Your quote includes an estimated timeline from concept to mass production.",
  },
  {
    question: "How do shipping and customs work?",
    answer:
      "We offer door-to-door options and explain freight, duties, and taxes before you commit. Rules and costs vary by destination country.",
  },
  {
    question: "Do I own the design and molds?",
    answer:
      "You own the final approved designs and brand assets. Ownership of tooling and molds is confirmed in your agreement, and we make it explicit before production.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Payment terms are agreed before production starts. Ask us for the current options and milestone schedule in your quote.",
  },
  {
    question: "What if the sample is not right?",
    answer:
      "We review the sample against your approved spec, document the issues, and rework or re-source before mass production. The exact revision policy is confirmed in your agreement.",
  },
];

export const serviceFaqGroups: {
  service: ServiceId;
  title: string;
  items: FaqItem[];
}[] = [
  {
    service: "sourcing",
    title: "Product Sourcing",
    items: [
      {
        question: "Can you source from a factory I already found?",
        answer:
          "Yes. We can vet the factory, negotiate, inspect, and manage shipping, or compare it against other suppliers before you commit.",
      },
      {
        question: "Do you handle quality inspections?",
        answer:
          "Yes. We can inspect samples and arrange pre-shipment checks. The inspection scope is agreed in your quote.",
      },
    ],
  },
  {
    service: "development",
    title: "Custom Product Development",
    items: [
      {
        question: "Do I need a technical drawing to start?",
        answer:
          "No. A sketch, reference product, or clear description is enough to begin. We turn it into a design and a manufacturable spec.",
      },
      {
        question: "How many sample rounds are included?",
        answer:
          "The number of sample rounds depends on the product and is agreed in your quote. We document each round and the changes before production.",
      },
    ],
  },
  {
    service: "software",
    title: "E-commerce Website & Software",
    items: [
      {
        question: "Can I use my own domain?",
        answer:
          "Yes. You can connect a custom domain or start on a provided subdomain. The setup is included in the store build.",
      },
      {
        question: "Can I manage orders and inventory myself?",
        answer:
          "Yes. The dashboard is built for day-to-day management, and we can train you or your team after launch.",
      },
    ],
  },
  {
    service: "content",
    title: "Media Content",
    items: [
      {
        question: "Do you shoot the product or do I send it to you?",
        answer:
          "Both are possible. We can shoot at our studio or work with product samples you send. The plan is confirmed before the shoot.",
      },
      {
        question: "What formats do I receive?",
        answer:
          "You receive the agreed final formats for your store, ads, and social channels, plus an organized asset library for future use.",
      },
    ],
  },
  {
    service: "marketing",
    title: "Marketing & Growth",
    items: [
      {
        question: "Which channels do you manage?",
        answer:
          "The channel mix depends on your product and market. We can cover SEO, social, paid ads, email, and WhatsApp campaigns.",
      },
      {
        question: "How do you report performance?",
        answer:
          "You get a clear report on the channels and numbers agreed in your plan, with what changed and what happens next.",
      },
    ],
  },
];

export const contactFaqs: FaqItem[] = [
  {
    question: "Is the quote really free?",
    answer:
      "Yes. Share your idea or product, and we will review it and send a plan and quote with no obligation.",
  },
  {
    question: "How quickly will I hear back?",
    answer:
      "We aim to reply within 24 hours. If your brief needs a specialist, we will tell you who is reviewing it and when to expect the next update.",
  },
  {
    question: "Can I start with just one service?",
    answer:
      "Yes. You can start with sourcing, development, a store, content, or marketing on its own, then add services as you grow.",
  },
  {
    question: "What if I do not have a finished idea yet?",
    answer:
      "That is fine. Send what you have — a category, a problem you want to solve, or a reference product. We can help shape the next step.",
  },
];
