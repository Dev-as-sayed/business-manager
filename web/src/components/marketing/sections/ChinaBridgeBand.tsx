import { FiCheck, FiPackage } from "react-icons/fi";
import { Container } from "@/components/marketing/ui/Container";
import { Eyebrow } from "@/components/marketing/ui/Eyebrow";
import { SectionHeading } from "@/components/marketing/ui/SectionHeading";
import { Button } from "@/components/marketing/ui/Button";
import { StatCounter } from "@/components/marketing/ui/StatCounter";
import { PlaceholderImage } from "@/components/marketing/ui/PlaceholderImage";
import { PlaceholderTag } from "@/components/marketing/ui/PlaceholderTag";
import { Reveal } from "@/components/marketing/ui/Reveal";
import { bridgePoints, stats as defaultStats } from "@/content/home";
import { ctaLinks } from "@/content/site";
import { messages } from "@/i18n/messages/en";

const routeSteps = [
  "Factory vetted",
  "Sample approved",
  "Quality inspected",
  "Order consolidated",
  "Shipped door-to-door",
];

const bridgePhotos = [
  { kind: "factory" as const, label: "Factory" },
  { kind: "quality" as const, label: "QC bench" },
  { kind: "shipping" as const, label: "Shipping" },
];

export function ChinaBridgeBand({
  title = "A team on the ground, so you are not guessing from another time zone.",
  description = "We vet factories, negotiate in person, inspect before shipping, and consolidate your order. You get one point of contact and a clear route from factory to door.",
  stats = defaultStats,
  showTeamLink = false,
}: {
  title?: string;
  description?: string;
  stats?: { label: string; value: string; note: string }[];
  showTeamLink?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-band py-20 text-white sm:py-24 lg:py-28">
      <div
        aria-hidden="true"
        className="blueprint-grid-inverse pointer-events-none absolute inset-0 opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-lime/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-lime/10 blur-3xl"
      />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <Eyebrow tone="inverse">China → your door</Eyebrow>
            <SectionHeading
              tone="inverse"
              title={title}
              description={description}
              className="mt-4 max-w-2xl"
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {bridgePoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-band-muted"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-lime text-lime-contrast">
                    <FiCheck aria-hidden="true" className="h-2.5 w-2.5" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {bridgePhotos.map((photo) => (
                <PlaceholderImage
                  key={photo.kind}
                  kind={photo.kind}
                  alt={`${photo.label} in China`}
                  label={photo.label}
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 1024px) 14vw, 30vw"
                  className="border-white/10"
                />
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={ctaLinks.quote} size="lg" arrow>
                {messages.nav.quote}
              </Button>
              {showTeamLink ? (
                <Button href="/about" size="lg" variant="inverse">
                  Meet the team
                </Button>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-band-surface p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-band-muted">
                  Route overview
                </p>
                <PlaceholderTag label="Illustrative route" tone="inverse" />
              </div>

              <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-band p-3">
                <svg
                  role="img"
                  aria-label="Illustrative route from a factory in China to your door"
                  viewBox="0 0 400 220"
                  className="h-auto w-full"
                  fill="none"
                >
                  <defs>
                    <pattern
                      id="route-dots"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle cx="1.5" cy="1.5" r="1" fill="#2A352C" />
                    </pattern>
                  </defs>
                  <rect width="400" height="220" fill="url(#route-dots)" />
                  <path
                    d="M70 158C130 52 270 52 330 158"
                    stroke="var(--lime)"
                    strokeWidth="1.8"
                    strokeDasharray="5 9"
                    className="route-dash"
                  />
                  <circle cx="70" cy="158" r="7" fill="var(--lime)" />
                  <circle cx="70" cy="158" r="13" stroke="var(--lime)" strokeOpacity="0.3" />
                  <circle cx="330" cy="158" r="7" fill="var(--lime)" />
                  <circle cx="330" cy="158" r="13" stroke="var(--lime)" strokeOpacity="0.3" />
                  <text
                    x="70"
                    y="190"
                    textAnchor="middle"
                    fill="#A7B3A5"
                    fontSize="9"
                    letterSpacing="2"
                    fontFamily="monospace"
                  >
                    CHINA
                  </text>
                  <text
                    x="330"
                    y="190"
                    textAnchor="middle"
                    fill="#A7B3A5"
                    fontSize="9"
                    letterSpacing="2"
                    fontFamily="monospace"
                  >
                    YOUR DOOR
                  </text>
                  <text
                    x="200"
                    y="70"
                    textAnchor="middle"
                    fill="#A7B3A5"
                    fontSize="9"
                    letterSpacing="2"
                    fontFamily="monospace"
                  >
                    ONE ROUTE
                  </text>
                </svg>
                <span className="absolute left-1/2 top-[42%] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-lime/30 bg-band text-lime shadow-[0_0_0_6px_rgba(200,241,105,0.08)]">
                  <FiPackage aria-hidden="true" className="h-4 w-4" />
                </span>
              </div>

              <ol className="mt-5 space-y-2.5">
                {routeSteps.map((step, index) => (
                  <li
                    key={step}
                    className="flex items-center gap-3 text-sm text-band-muted"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/5 font-mono text-[9px] text-lime">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">{step}</span>
                    <FiCheck aria-hidden="true" className="h-3.5 w-3.5 text-lime" />
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <StatCounter
                key={stat.label}
                value={stat.value}
                label={stat.label}
                note={stat.note}
                tone="inverse"
              />
            ))}
          </div>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.16em] text-band-muted">
            Placeholder metrics — replace with verified numbers before launch.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
