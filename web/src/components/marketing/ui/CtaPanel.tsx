import { Container } from "@/components/marketing/ui/Container";
import { Eyebrow } from "@/components/marketing/ui/Eyebrow";
import { Button } from "@/components/marketing/ui/Button";
import { ctaLinks } from "@/content/site";
import { messages } from "@/i18n/messages/en";
import { cn } from "@/lib/utils";

export function CtaPanel({
  eyebrow = "Your next step",
  title = "Ready to launch your brand?",
  description = "Tell us what you are building. We will review it, send a clear plan and quote, and tell you the fastest route to your first sale.",
  primaryLabel = messages.nav.start,
  primaryHref = ctaLinks.start,
  secondaryLabel = messages.nav.quote,
  secondaryHref = ctaLinks.quote,
  note = "Free quote. No commitment.",
  variant = "glow",
  className,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  note?: string;
  variant?: "glow" | "lime";
  className?: string;
}) {
  const isLime = variant === "lime";

  return (
    <section className={cn("py-16 md:py-24", className)}>
      <Container>
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl px-6 py-12 sm:px-10 sm:py-14 lg:px-16",
            isLime ? "bg-lime text-lime-contrast" : "bg-band text-white",
          )}
        >
          {isLime ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #0c120d 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />
          ) : (
            <>
              <div
                aria-hidden="true"
                className="blueprint-grid-inverse pointer-events-none absolute inset-0 opacity-70"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime/15 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-lime/10 blur-3xl"
              />
            </>
          )}

          <div className="relative max-w-2xl">
            <Eyebrow tone={isLime ? "onLime" : "inverse"}>{eyebrow}</Eyebrow>
            <h2
              className={cn(
                "type-h2 mt-4 font-semibold",
                isLime ? "text-lime-contrast" : "text-white",
              )}
            >
              {title}
            </h2>
            <p
              className={cn(
                "mt-5 max-w-xl text-base leading-[1.65] sm:text-lg",
                isLime ? "text-lime-contrast/80" : "text-band-muted",
              )}
            >
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                href={primaryHref}
                size="lg"
                arrow
                variant={isLime ? "dark" : "primary"}
              >
                {primaryLabel}
              </Button>
              <Button
                href={secondaryHref}
                size="lg"
                variant={isLime ? "onLime" : "inverse"}
              >
                {secondaryLabel}
              </Button>
            </div>
            <p
              className={cn(
                "mt-4 font-mono text-[10px] uppercase tracking-[0.16em]",
                isLime ? "text-lime-contrast/70" : "text-band-muted",
              )}
            >
              {note}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
