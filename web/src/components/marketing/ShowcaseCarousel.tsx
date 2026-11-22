"use client";

import { useRef } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { primaryCta, stories } from "@/lib/marketing-content";

export default function ShowcaseCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="showcase"
      className="scroll-mt-24 border-y border-border bg-secondary-background/60 py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              eyebrow="Showcase"
              title="Brands Launched With The Brand Launcher"
              description="Sample brands and results — replace with your real case studies before launch."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scroll(-1)}
                aria-label="Previous stories"
                className="rounded-full border border-border bg-background p-2.5 text-text-secondary transition hover:bg-accent hover:text-text-primary"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                aria-label="Next stories"
                className="rounded-full border border-border bg-background p-2.5 text-text-secondary transition hover:bg-accent hover:text-text-primary"
              >
                <FiArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Reveal>

        <div
          ref={trackRef}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Success stories carousel"
        >
          {stories.map((story) => (
            <article
              key={story.brand}
              className="flex w-[85%] shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-6 shadow-soft sm:w-[48%] lg:w-[32%]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {story.brand}
                  </h3>
                  <p className="text-sm text-text-muted">{story.industry}</p>
                </div>
                <span className="rounded-full bg-gold/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  Sample
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-text-secondary">
                {story.result}
              </p>

              <div className="mt-5 h-px w-full bg-border" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                What we did
              </p>
            </article>
          ))}
        </div>

        <Reveal className="mt-8 text-center">
          <Button href={primaryCta.href} size="lg" arrow>
            Start Your Success Story
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
