import { Container } from "@/components/marketing/ui/Container";
import { Eyebrow } from "@/components/marketing/ui/Eyebrow";
import { Button } from "@/components/marketing/ui/Button";
import { ctaLinks } from "@/content/site";
import { messages } from "@/i18n/messages/en";
import { cn } from "@/lib/utils";

export function CTABanner({
  title = "Ready to launch your brand?",
  description = "Tell us what you are building. We will review it, send a clear plan and quote, and tell you the fastest route to your first sale.",
  eyebrow = "Your next step",
  primaryLabel = messages.nav.start,
  primaryHref = ctaLinks.start,
  secondaryLabel = messages.nav.consultation,
  secondaryHref = ctaLinks.consultation,
  note = "Free quote. No commitment.",
  className,
}: {
  title?: string;
  description?: string;
  eyebrow?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  note?: string;
  className?: string;
}) {
  return (
    <section className={cn("py-20 sm:py-24", className)}>
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-band px-6 py-12 text-white sm:px-10 sm:py-14 lg:px-16">
          <div aria-hidden="true" className="caution-stripe absolute inset-x-0 top-0 h-1.5" />
          <div
            aria-hidden="true"
            className="blueprint-grid-inverse pointer-events-none absolute inset-0 opacity-70"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-3xl"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 420 220"
            className="pointer-events-none absolute bottom-0 right-0 hidden h-52 w-80 text-lime/40 lg:block"
            fill="none"
          >
            <path
              d="M20 190C110 190 140 40 230 40s120 150 180 150"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="5 9"
              className="route-dash"
            />
            <circle cx="20" cy="190" r="4" fill="currentColor" />
            <circle cx="410" cy="190" r="4" fill="currentColor" />
          </svg>

          <div className="relative max-w-2xl">
            <Eyebrow tone="inverse">{eyebrow}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.03] tracking-[-0.04em] text-balance sm:text-4xl lg:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-band-muted sm:text-lg">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href={primaryHref} size="lg" arrow>
                {primaryLabel}
              </Button>
              <Button
                href={secondaryHref}
                size="lg"
                variant="inverse"
              >
                {secondaryLabel}
              </Button>
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-band-muted">
              {note}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
