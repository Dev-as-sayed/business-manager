import type { Metadata } from "next";
import type { IconType } from "react-icons";
import {
  FiAward,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiCompass,
  FiDollarSign,
  FiEye,
  FiFileText,
  FiLayers,
  FiLock,
  FiMessageCircle,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiTarget,
  FiUnlock,
  FiUserCheck,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { Button } from "@/components/marketing/ui/Button";
import { Card } from "@/components/marketing/ui/Card";
import { Container } from "@/components/marketing/ui/Container";
import { CtaPanel } from "@/components/marketing/ui/CtaPanel";
import { Eyebrow } from "@/components/marketing/ui/Eyebrow";
import { PlaceholderImage } from "@/components/marketing/ui/PlaceholderImage";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { SectionHeading } from "@/components/marketing/ui/SectionHeading";
import { ChinaBridgeBand } from "@/components/marketing/sections/ChinaBridgeBand";
import {
  mission,
  problemFixes,
  promises,
  pullQuote,
  teamGroups,
  timeline,
  trustItems,
  values,
  vision,
} from "@/content/about";
import { ctaLinks } from "@/content/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    absolute:
      "About Omnia | Your Product Sourcing & Brand Launch Team in China",
  },
  description:
    "About Omnia — your product sourcing and brand launch team in China. We turn ideas into profitable brands.",
  alternates: { canonical: "/about" },
  openGraph: {
    title:
      "About Omnia | Your Product Sourcing & Brand Launch Team in China",
    description:
      "Learn about our mission, team, and how we help entrepreneurs launch product brands from China.",
    url: "/about",
  },
};

const problemIcons: IconType[] = [
  FiPackage,
  FiMessageCircle,
  FiDollarSign,
  FiClock,
  FiLayers,
  FiCode,
];

const valueIcons: IconType[] = [FiEye, FiAward, FiZap, FiUsers, FiUnlock];

const promiseIcons: IconType[] = [
  FiFileText,
  FiCheckCircle,
  FiSearch,
  FiUserCheck,
  FiRefreshCw,
];

const trustIcons: IconType[] = [FiFileText, FiAward, FiBriefcase, FiLock];

const teamMembers = teamGroups.flatMap((group) =>
  group.members.map((member) => ({ ...member, group: group.name })),
);

function splitGrid(index: number) {
  return cn(
    index < 3 ? "lg:col-span-2" : "lg:col-span-3",
    index === 4 && "sm:col-span-2",
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="blueprint-grid pointer-events-none absolute inset-0 opacity-50"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-lime/15 blur-3xl"
        />

        <Container className="relative py-12 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <Eyebrow>China → your door</Eyebrow>
              <h1 className="type-h1 mt-4 max-w-[19ch] font-semibold text-ink">
                We Built the Bridge Between Your Idea and the Factory Floor.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-[1.65] text-ink-muted sm:text-lg">
                One bilingual team for sourcing, product development, your online
                store, content, and marketing. One route, one owner, one clear
                next step.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href={ctaLinks.start} size="lg" arrow>
                  Start Your Brand
                </Button>
                <Button href="#team" size="lg" variant="secondary">
                  Meet the team
                </Button>
              </div>
            </div>

            <PlaceholderImage
              kind="team"
              alt="China team collaborating on a brand launch"
              label="China team photo"
              aspect="aspect-[4/3]"
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority
            />
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
            <Reveal>
              <SectionHeading
                eyebrow="Our story"
                title="From a single problem to one platform."
                description="Omnia started with a familiar problem: a product idea with no clear path from a factory in China to a customer’s door. Months disappeared into agents, translators, designers, developers, and shippers who each owned a different piece of the launch."
                className="max-w-2xl"
              />
            </Reveal>

            <Reveal delay={0.08}>
              <div className="space-y-4">
                <blockquote className="rounded-2xl border border-line border-l-4 border-l-lime bg-surface p-6 sm:p-8">
                  <p className="font-display text-xl font-light leading-relaxed text-ink-muted">
                    “{pullQuote}”
                  </p>
                  <cite className="mt-4 block font-medium not-italic text-ink">
                    — Founder, Omnia
                  </cite>
                </blockquote>

                <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
                  <PlaceholderImage
                    kind="team"
                    alt="Founder portrait placeholder"
                    label="Founder photo"
                    aspect="aspect-square"
                    sizes="96px"
                    caption={false}
                    className="w-20 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Founder name
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
                      Founder, Omnia · Name and photo placeholders
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface/40 py-16 md:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="The problem we solve"
              title="The problems we remove from the route."
              description="Most founders lose time stitching together agents, designers, developers, shippers, and marketers. Omnia puts the whole route under one roof, with one team accountable for the handoffs."
              className="max-w-2xl"
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problemFixes.map((fix, index) => {
              const Icon = problemIcons[index] ?? FiPackage;

              return (
                <Reveal key={fix.problem} delay={index * 0.04}>
                  <Card icon={<Icon />}>
                    <h3 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink">
                      {fix.problem}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
                      {fix.fix}
                    </p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What we stand for"
              title="Values we do not compromise on."
              description="Our values guide every decision, every project, and every interaction. They are the foundation of trust and quality."
              className="max-w-2xl"
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {values.map((value, index) => {
              const Icon = valueIcons[index] ?? FiEye;

              return (
                <Reveal
                  key={value.title}
                  delay={index * 0.04}
                  className={cn("h-full", splitGrid(index))}
                >
                  <Card icon={<Icon />}>
                    <h3 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
                      {value.description}
                    </p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface/40 py-16 md:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="How we work"
              title="What every engagement includes."
              description="Transparent pricing, a sample before mass production, inspection before shipping, a dedicated account manager, and regular updates."
              className="max-w-2xl"
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {promises.map((promise, index) => {
              const Icon = promiseIcons[index] ?? FiCheckCircle;

              return (
                <Reveal
                  key={promise.title}
                  delay={index * 0.04}
                  className={cn("h-full", splitGrid(index))}
                >
                  <Card icon={<Icon />}>
                    <h3 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink">
                      {promise.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]">
                      {promise.description}
                    </p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="team" className="scroll-mt-24 py-16 md:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Our team on the ground in China"
              title="Bilingual, on the ground, accountable."
              description="We vet factories, negotiate prices, inspect quality, and consolidate orders for door-to-door delivery."
              className="max-w-2xl"
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <Reveal key={`${member.group}-${member.initials}`} delay={index * 0.04}>
                <div className="h-full rounded-2xl border border-line bg-surface p-3">
                  <PlaceholderImage
                    kind="team"
                    alt={`${member.role} portrait placeholder`}
                    label={`${member.role} photo`}
                    aspect="aspect-square"
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                    caption={false}
                    className="rounded-xl"
                  />
                  <div className="px-2 pb-2 pt-4">
                    <p className="text-sm font-semibold text-ink">
                      {member.name}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-lime-ink">
                      {member.role}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                      {member.bio}
                    </p>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-muted">
                      {member.group}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ChinaBridgeBand />

      <section className="py-16 md:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Why we exist"
              title="One route, one owner, one clear next step."
              className="max-w-2xl"
            />
          </Reveal>
          <div className="mt-10 grid items-stretch gap-4 md:grid-cols-2">
            <Reveal>
              <Card variant="featured" icon={<FiTarget />}>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime-ink">
                  Mission
                </p>
                <h3 className="type-h3 mt-3 font-semibold text-ink">
                  {mission}
                </h3>
              </Card>
            </Reveal>
            <Reveal delay={0.08}>
              <Card icon={<FiCompass />}>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
                  Vision
                </p>
                <h3 className="type-h3 mt-3 font-semibold text-ink">
                  {vision}
                </h3>
              </Card>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface/40 py-16 md:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Trust"
              title="Trust, in writing."
              description="Verification details will be published here before launch. Ask us for current documentation at any time."
              className="max-w-2xl"
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item, index) => {
              const Icon = trustIcons[index] ?? FiFileText;

              return (
                <Reveal key={item.title} delay={index * 0.04}>
                  <Card variant="quiet" icon={<Icon />}>
                    <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {item.description}
                    </p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
              <Eyebrow>Our timeline</Eyebrow>
              <SectionHeading
                title="From one problem to one route."
                description="The decisions that shaped how Omnia works today."
                className="mt-4"
              />
            </div>

            <ol className="relative space-y-8">
              <span
                aria-hidden="true"
                className="absolute bottom-5 left-5 top-5 w-px bg-line"
              />
              {timeline.map((item, index) => (
                <li key={item.title} className="relative flex items-start gap-4">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime font-mono text-xs font-semibold text-lime-contrast">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-0.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-lime-ink">
                      {item.label}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <CtaPanel
        title="Let’s build your brand together."
        description="Tell us about your idea and we’ll map the route from factory to customer."
        primaryLabel="Start Your Brand"
        primaryHref={ctaLinks.start}
        secondaryLabel="Get a Free Product Quote"
        secondaryHref={ctaLinks.quote}
      />
    </div>
  );
}
