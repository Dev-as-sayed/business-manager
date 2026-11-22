import type { ProjectType } from "@/content/site";

export const serviceOptions = [
  "Product sourcing",
  "Custom development",
  "E-commerce website",
  "Media content",
  "Marketing",
  "Full brand launch",
];

export const projectTypes: {
  value: ProjectType;
  label: string;
  description: string;
}[] = [
  {
    value: "sourcing",
    label: "Product sourcing",
    description: "Find a factory, compare quotes, sample, and ship.",
  },
  {
    value: "custom-product",
    label: "Custom product",
    description: "Turn an idea or sketch into a manufacturable product.",
  },
  {
    value: "website",
    label: "E-commerce website",
    description: "Build or upgrade a store and management dashboard.",
  },
  {
    value: "full-launch",
    label: "Full brand launch",
    description: "Connect product, store, content, and marketing.",
  },
];

export const budgetOptions = [
  "Not sure yet",
  "Under $2,000",
  "$2,000 – $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000+",
];

export const nextSteps = [
  {
    title: "We review your brief",
    description:
      "A real person reads it, checks feasibility, and asks only the questions that matter.",
  },
  {
    title: "We send a plan and quote",
    description:
      "You get a clear scope, timeline, and cost breakdown. No mystery line items.",
  },
  {
    title: "We start your project",
    description:
      "Once you approve, we assign your team and begin the first milestone.",
  },
];
