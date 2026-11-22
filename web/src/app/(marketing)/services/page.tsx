import type { Metadata } from "next";
import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/marketing/ui/Button";
import { Card } from "@/components/marketing/ui/Card";
import { Container } from "@/components/marketing/ui/Container";
import { CtaPanel } from "@/components/marketing/ui/CtaPanel";
import { Eyebrow } from "@/components/marketing/ui/Eyebrow";
import { FAQAccordion } from "@/components/marketing/ui/FAQAccordion";
import { FaqJsonLd } from "@/components/marketing/ui/JsonLd";
import {
  PlaceholderImage,
  type PlaceholderKind,
} from "@/components/marketing/ui/PlaceholderImage";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { SectionHeading } from "@/components/marketing/ui/SectionHeading";
import { ServicesNav } from "@/components/marketing/sections/ServicesNav";
import { services, serviceOrder, type ServiceId } from "@/content/services";
import { serviceFaqGroups } from "@/content/faqs";
import { ctaLinks } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute:
      "Services | Product Sourcing, Custom Development, E-commerce Website, Content & Marketing",
  },
  description:
    "Services | Product Sourcing, Custom Development, E-commerce Website, Content & Marketing — everything your brand needs under one roof.",
  alternates: { canonical: "/services" },
  openGraph: {
    title:
      "Services | Product Sourcing, Custom Development, E-commerce Website, Content & Marketing",
    description:
      "Services overview: sourcing, custom product development, e-commerce software, media content, and marketing growth strategies.",
    url: "/services",
  },
};

const serviceImages: Record<ServiceId, PlaceholderKind> = {
  sourcing: "factory",
  development: "quality",
  software: "storefront",
  content: "packaging",
  marketing: "shipping",
};

const packages = [
  {
    name: "Starter",
    description: "Core services to start your brand journey.",
    features: [services[0].name, services[1].name, "Launch plan and quote"],
    popular: false,
  },
  {
    name: "Growth",
    description: "Expanded service coverage for growing brands.",
    features: [services[2].name, services[3].name, services[4].name],
    popular: true,
  },
  {
    name: "Scale",
    description: "The full suite for established brands.",
    features: [
      ...services.map((service) => service.name),
      "Dedicated account manager",
    ],
    popular: false,
  },
];

const journeySteps = [
  {
    title: "Share your idea or product brief",
    description:
      "Tell us what you are building, your target market, and your vision.",
  },
  {
    title: "Sourcing or development",
    description:
      "We vet factories, negotiate, design, prototype, and inspect samples.",
  },
  {
    title: "Store setup",
    description:
      "AI website builder setup, product catalog, payments, and shipping.",
  },
  {
    title: "Content & marketing",
    description:
      "Product photography, video, ad creatives, and campaign launch.",
  },
  {
    title: "Launch, shipping & sales",
    description:
      "Door-to-door shipping, order monitoring, and growth support.",
  },
];

const allServiceFaqs = serviceFaqGroups.flatMap((group) => group.items);

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <ServicesNav />

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <Eyebrow>Everything your brand needs</Eyebrow>
              <h1 className="type-h1 mt-4 max-w-2xl font-semibold text-ink">
                Everything Your Brand Needs. One Team.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-[1.65] text-ink-muted sm:text-lg">
                Five connected services under one roof. From product sourcing to
                marketing growth, we own the whole route.
              </p>
            </div>

            <PlaceholderImage
              kind="team"
              alt="Team collaborating on a brand launch"
              label="Brand launch team"
              aspect="aspect-[16/10]"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </Container>
      </section>

      {serviceOrder.map((id, index) => {
        const service = services.find((item) => item.id === id);
        if (!service) return null;
        const reversed = index % 2 === 1;

        return (
          <section
            key={id}
            id={id}
            className={cn(
              "scroll-mt-[calc(var(--header-h)+4rem)] border-y border-line py-16 md:py-24",
              reversed ? "bg-surface/40" : "bg-paper",
            )}
          >
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <Reveal className={cn(reversed && "lg:order-2")}>
                  <Eyebrow>{service.shortName}</Eyebrow>
                  <h2 className="type-h2 mt-4 font-semibold text-ink">
                    {service.name}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-[1.65] text-ink-muted">
                    {service.description}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button href={service.ctaHref} size="lg" arrow>
                      {service.ctaLabel}
                    </Button>
                    <Button href="#packages" size="lg" variant="secondary">
                      See packages
                    </Button>
                  </div>
                </Reveal>

                <Reveal
                  delay={0.08}
                  className={cn(reversed && "lg:order-1")}
                >
                  <PlaceholderImage
                    kind={serviceImages[service.id]}
                    alt={`${service.name} illustration`}
                    label={service.shortName}
                    aspect="aspect-[16/10]"
                    sizes="(min-width: 1024px) 45vw, 100vw"
                  />
                </Reveal>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-14">
                <Reveal>
                  <Card>
                    <h3 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink">
                      What&apos;s included
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {service.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-lime-contrast">
                            <FiCheck
                              aria-hidden="true"
                              className="h-3 w-3"
                            />
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Reveal>

                <Reveal delay={0.08}>
                  <Card>
                    <h3 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink">
                      How it works
                    </h3>
                    <ol className="relative mt-5 space-y-5">
                      <span
                        aria-hidden="true"
                        className="absolute bottom-4 left-4 top-4 w-px bg-line"
                      />
                      {service.steps.map((step, stepIndex) => (
                        <li
                          key={step.title}
                          className="relative flex items-start gap-3"
                        >
                          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime font-mono text-[11px] font-semibold text-lime-contrast">
                            {String(stepIndex + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {step.title}
                            </p>
                            <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                              {step.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Card>
                </Reveal>
              </div>
            </Container>
          </section>
        );
      })}

      <section
        id="packages"
        className="scroll-mt-[calc(var(--header-h)+4rem)] border-y border-line bg-lime py-16 text-lime-contrast md:py-24"
      >
        <Container>
          <Eyebrow tone="onLime">Launch packages</Eyebrow>
          <h2 className="type-h2 mt-4 max-w-2xl font-semibold text-lime-contrast">
            Pick a starting point. Scale when you are ready.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-[1.65] text-lime-contrast/80">
            Every package is quoted after a short brief. No fixed prices, no
            surprise line items.
          </p>

          <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-3">
            {packages.map((pack, index) => (
              <Reveal key={pack.name} delay={index * 0.06} className="h-full">
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border bg-paper p-6 text-ink transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift md:p-8",
                    pack.popular
                      ? "border-lime-contrast shadow-lift"
                      : "border-lime-contrast/15",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                      {pack.name}
                    </h3>
                    {pack.popular ? (
                      <span className="rounded-full bg-lime-contrast px-2.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-lime">
                        Most popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {pack.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {pack.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-lime-contrast">
                          <FiCheck aria-hidden="true" className="h-3 w-3" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-8">
                    <Button
                      href={ctaLinks.quote}
                      variant={pack.popular ? "primary" : "secondary"}
                      fullWidth
                      arrow
                    >
                      Get My Custom Quote
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section
        id="journey"
        className="scroll-mt-[calc(var(--header-h)+4rem)] border-y border-line bg-surface/40 py-16 md:py-24"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
              <Eyebrow>Full journey</Eyebrow>
              <SectionHeading
                title="Idea to first delivered order."
                description="Five stages, one owner, and a shared view of what happens next. Timelines and costs are confirmed in your quote."
                className="mt-4"
              />
            </div>

            <ol className="relative space-y-8">
              <span
                aria-hidden="true"
                className="absolute bottom-5 left-5 top-5 w-px bg-line"
              />
              {journeySteps.map((step, index) => (
                <li key={step.title} className="relative flex items-start gap-4">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime font-mono text-sm font-semibold text-lime-contrast">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-base font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section id="faq" className="py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <Eyebrow>Service FAQ</Eyebrow>
              <SectionHeading
                title="Questions, by service."
                description="The details founders usually ask about before choosing a starting point."
                className="mt-4"
              />
            </div>
            <FAQAccordion items={allServiceFaqs} />
          </div>
          <FaqJsonLd
            items={allServiceFaqs.map((item) => ({
              question: item.question,
              answer: item.answer,
            }))}
          />
        </Container>
      </section>

      <CtaPanel
        eyebrow="Your next step"
        title="Everything your brand needs. One team."
        description="Tell us where you are starting from and we will map the route, the timeline, and the cost before you commit."
        primaryLabel="Start Your Brand"
        primaryHref={ctaLinks.start}
        secondaryLabel="Get a Free Product Quote"
        secondaryHref={ctaLinks.quote}
        note="Free quote. No commitment."
      />
    </div>
  );
}
