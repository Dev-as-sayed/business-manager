"use client";

import { FaQuoteLeft } from "react-icons/fa";
import Button from "@/components/marketing/Button";
import PlaceholderImage from "@/components/marketing/PlaceholderImage";
import Reveal from "@/components/marketing/Reveal";
import { primaryCta } from "@/lib/marketing-content";
import { aboutContent } from "@/lib/marketing-pages";

export default function StorySection() {
  const { story } = aboutContent;

  return (
    <section className="border-y border-border bg-secondary-background/60 py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              {story.eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-text-primary sm:text-4xl">
              {story.title}
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-text-secondary">
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {story.placeholder && (
              <p className="mt-4 inline-flex rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold">
                Placeholder founder story
              </p>
            )}
            <div className="mt-7">
              <Button href={primaryCta.href} arrow>
                {primaryCta.label}
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-5">
            <PlaceholderImage
              label="Founder photo"
              hint="Placeholder image — add a real founder photo"
              aspect="aspect-[4/3]"
              className="shadow-card"
            />
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <FaQuoteLeft
                className="h-5 w-5 text-gold"
                aria-hidden="true"
              />
              <blockquote className="mt-3 text-lg font-medium leading-relaxed text-text-primary">
                “{story.quote}”
              </blockquote>
              <p className="mt-3 text-sm font-semibold text-text-muted">
                — {story.quoteAttribution}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
