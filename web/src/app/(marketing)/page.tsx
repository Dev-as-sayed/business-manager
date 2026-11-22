import type { Metadata } from "next";
import {
  FiCheck,
  FiCompass,
  FiShoppingBag,
  FiVideo,
  FiX,
} from "react-icons/fi";
import { Button } from "@/components/marketing/ui/Button";
import { Card } from "@/components/marketing/ui/Card";
import { Container } from "@/components/marketing/ui/Container";
import { CtaPanel } from "@/components/marketing/ui/CtaPanel";
import { Eyebrow } from "@/components/marketing/ui/Eyebrow";
import { FAQAccordion } from "@/components/marketing/ui/FAQAccordion";
import { FaqJsonLd } from "@/components/marketing/ui/JsonLd";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { SectionHeading } from "@/components/marketing/ui/SectionHeading";
import { ServiceCard } from "@/components/marketing/ui/ServiceCard";
import { StepTimeline } from "@/components/marketing/ui/StepTimeline";
import { ChinaBridgeBand } from "@/components/marketing/sections/ChinaBridgeBand";
import { ShowcaseCarousel } from "@/components/marketing/sections/ShowcaseCarousel";
import { LaunchRail } from "@/components/marketing/sections/LaunchRail";
import { SoftwarePreview } from "@/components/marketing/sections/SoftwarePreview";
import { homeFaqs } from "@/content/faqs";
import {
  howItWorks,
  oldWay,
  omniaWay,
  personas,
  pricingRows,
} from "@/content/home";
import { services } from "@/content/services";
import { ctaLinks } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute: "Omnia | Source, Create & Launch Your Product Brand From China",
  },
  description:
    "Omnia is one team for product sourcing, custom development, e-commerce, content, and marketing. Launch your product brand from China with one clear route to market.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Omnia | Source, Create & Launch Your Product Brand From China",
    description:
      "One team for sourcing, product development, your online store, content, and marketing — from factory floor to first sale.",
    url: "/",
  },
};

const personaIcons = [FiCompass, FiShoppingBag, FiVideo];

const quoteInputs = [
  "Product or idea",
  "Target quantity",
  "Destination country",
  "Launch timeline",
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="blueprint-grid pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-lime/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-lime/10 blur-3xl"
        />

        <Container className="relative py-12 sm:py-16 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <Eyebrow>China → your door</Eyebrow>
              <h1 className="type-h1 mt-5 max-w-[18ch] font-semibold text-ink">
                From Product Idea to Profitable Brand. All in One Place.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-[1.65] text-pretty text-ink-muted sm:text-lg">
                Omnia is one team for product sourcing, custom development, your
                online store, content, and marketing — from factory floor to
                first sale.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button href={ctaLinks.start} size="lg" arrow>
                  Start Your Brand
                </Button>
                <Button
                  href={ctaLinks.quote}
                  size="lg"
                  variant="secondary"
                >
                  Get a Free Product Quote
                </Button>
              </div>
              <ul className="mt-6 flex flex-wrap items-center gap-2">
                {[
                  "Free quote",
                  "No commitment",
                  "One point of contact",
                ].map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-medium text-ink-muted"
                  >
                    <FiCheck
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-lime-ink"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Reveal delay={0.1}>
              <LaunchRail />
            </Reveal>
          </div>
        </Container>
      </section>

      <div className="border-y border-line bg-surface/60">
        <Container className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            One team · Five services · One route to market
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink-muted">
            <span>First-time founders</span>
            <span>Small businesses going online</span>
            <span>Creators launching a product</span>
          </div>
        </Container>
      </div>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="The difference"
              title="Launching a product should not require five vendors and a group chat."
              description="Most founders lose time stitching together agents, designers, developers, shippers, and marketers. Omnia puts the whole route under one roof, with one team accountable for the handoffs."
              className="max-w-2xl"
            />
          </Reveal>

          <div className="mt-10 grid items-stretch gap-4 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-line bg-surface-2/50 p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink-muted">
                    The usual route
                  </h3>
                  <span className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                    Before
                  </span>
                </div>
                <ul className="mt-5 space-y-3">
                  {oldWay.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
                        <FiX
                          aria-hidden="true"
                          className="h-2.5 w-2.5 text-ink-muted/70"
                        />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative h-full overflow-hidden rounded-2xl border border-lime bg-lime p-6 text-lime-contrast sm:p-7">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/40 blur-2xl"
                />
                <div className="relative flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.025em] text-lime-contrast">
                    The Omnia route
                  </h3>
                  <span className="rounded-full bg-lime-contrast px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-lime">
                    One team
                  </span>
                </div>
                <ul className="relative mt-5 space-y-3">
                  {omniaWay.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-lime-contrast"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-contrast text-lime">
                        <FiCheck aria-hidden="true" className="h-2.5 w-2.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            No two launches are identical. Your scope and timeline are confirmed
            in writing.
          </p>
        </Container>
      </section>

      <section className="border-y border-line bg-surface/40 py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <SectionHeading
                eyebrow="Services"
                title="Everything you need to launch, under one roof."
                description="Start with one service or hand us the whole route. Every engagement is scoped before work begins."
                className="max-w-2xl"
              />
            </Reveal>
            <Button href="/services" variant="link" arrow>
              Explore all services
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                className={cn(
                  index < 2 ? "lg:col-span-3" : "lg:col-span-2",
                  index === 4 && "sm:col-span-2",
                )}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="A clear route from idea to first sale."
              description="Five stages, one owner, and a shared view of what happens next."
              className="max-w-2xl"
            />
          </Reveal>
          <StepTimeline steps={howItWorks} className="mt-10" />
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            Timelines and costs are confirmed in your quote.
          </p>
        </Container>
      </section>

      <ChinaBridgeBand />

      <section className="overflow-hidden py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal>
              <Eyebrow>Software</Eyebrow>
              <SectionHeading
                title="Your store and your back office, built together."
                description="Launch a branded storefront, then run orders, inventory, customers, and analytics from the same place."
                className="mt-4"
              />
              <ul className="mt-7 flex flex-wrap gap-2">
                {[
                  "AI website builder",
                  "Orders & inventory",
                  "Sales analytics",
                ].map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime-soft text-ink">
                      <FiCheck aria-hidden="true" className="h-2.5 w-2.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={ctaLinks.store} arrow>
                  Build My Store
                </Button>
                <Button href="/services#software" variant="secondary">
                  See the software service
                </Button>
              </div>
              <p className="mt-4 text-xs text-ink-muted">
                Available standalone or as part of a full launch.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <SoftwarePreview />
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface/40 py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Sample launch stories"
              title="Three starting points. One route to market."
              description="Illustrative scenarios only — not client case studies. Replace them with real stories before launch."
              className="max-w-2xl"
            />
          </Reveal>

          <div className="mt-8">
            <ShowcaseCarousel />
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Pricing"
              title="Clear costs. No surprise line items."
              description="You see the service package, product cost, freight, and our fee before you commit. Every project is quoted after a short brief."
              className="max-w-2xl"
            />
          </Reveal>

          <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 md:p-8">
                <Eyebrow>What we need</Eyebrow>
                <h3 className="type-h3 mt-3 font-semibold text-ink">
                  Four details for an accurate quote.
                </h3>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {quoteInputs.map((item, index) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 text-sm text-ink-muted"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime font-mono text-[10px] font-semibold text-lime-contrast">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs leading-relaxed text-ink-muted">
                  Send these four things and we will reply with a clear plan,
                  timeline, and cost breakdown.
                </p>
                <div className="mt-auto pt-7">
                  <Button href={ctaLinks.quote} arrow>
                    Get a Free Product Quote
                  </Button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-2/40">
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
                  <p className="text-sm font-semibold text-ink">
                    How your quote is built
                  </p>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                    Line by line
                  </span>
                </div>
                <ul className="divide-y divide-line">
                  {pricingRows.map((row) => (
                    <li
                      key={row.label}
                      className="grid grid-cols-[1fr_auto] gap-3 px-5 py-4 sm:px-6"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {row.label}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                          {row.detail}
                        </p>
                      </div>
                      <span className="h-fit whitespace-nowrap rounded-full border border-line bg-paper px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-muted">
                        {row.tag}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto border-t border-line bg-lime-soft px-5 py-4 text-xs leading-relaxed text-ink sm:px-6">
                  The exact package, MOQ, and freight are confirmed in writing
                  before production.
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface/40 py-16 sm:py-20 lg:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Who it is for"
              title="Built for your starting point."
              description="Whether you have a sketch, an existing product, or an audience ready to buy, the route starts with what you already have."
              className="max-w-2xl"
            />
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {personas.map((persona, index) => {
              const Icon = personaIcons[index] ?? FiCompass;

              return (
                <Reveal key={persona.title} delay={index * 0.06}>
                  <Card icon={<Icon />}>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-xl font-semibold tracking-[-0.025em] text-ink">
                      {persona.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {persona.description}
                    </p>
                    <ul className="mt-5 space-y-2.5">
                      {persona.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-sm text-ink-muted"
                        >
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime-soft text-ink">
                            <FiCheck
                              aria-hidden="true"
                              className="h-2.5 w-2.5"
                            />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-auto border-t border-line pt-4 text-sm font-medium text-ink">
                      {persona.outcome}
                    </p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <Reveal>
              <Eyebrow>FAQ</Eyebrow>
              <SectionHeading
                title="Questions founders ask before they commit."
                description="If yours is not here, ask us directly. We answer before you spend anything."
                className="mt-4"
              />
              <Button href="/contact" variant="secondary" className="mt-6" arrow>
                Ask a question
              </Button>
            </Reveal>
            <Reveal delay={0.1}>
              <FAQAccordion items={homeFaqs} />
            </Reveal>
          </div>
          <FaqJsonLd items={homeFaqs} />
        </Container>
      </section>

      <CtaPanel />
    </>
  );
}
