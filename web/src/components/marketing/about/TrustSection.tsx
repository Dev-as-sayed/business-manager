"use client";

import { useRef } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Icon from "@/components/marketing/Icon";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { aboutContent } from "@/lib/marketing-pages";

export default function TrustSection() {
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
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Trust & credibility"
            title="Built on Accountability"
            description="Placeholders for the credentials and proof that will be added before launch."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {aboutContent.trustItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <article className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {item.description}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Placeholder
                </span>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-14">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-text-primary">
                  What clients say
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  Placeholder testimonials — replace with real client quotes.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => scroll(-1)}
                  aria-label="Previous testimonials"
                  className="rounded-full border border-border bg-background p-2 text-text-secondary transition hover:bg-accent hover:text-text-primary"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll(1)}
                  aria-label="Next testimonials"
                  className="rounded-full border border-border bg-background p-2 text-text-secondary transition hover:bg-accent hover:text-text-primary"
                >
                  <FiArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>

          <div
            ref={trackRef}
            className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Testimonials carousel"
          >
            {aboutContent.testimonials.map((testimonial) => (
              <article
                key={testimonial.quote}
                className="w-[85%] shrink-0 snap-start rounded-2xl border border-border bg-card p-6 shadow-soft sm:w-[48%] lg:w-[32%]"
              >
                <span className="text-3xl leading-none text-gold">“</span>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {testimonial.quote}
                </p>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-sm font-semibold text-text-primary">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-text-muted">
                    {testimonial.company}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <Reveal className="mt-8 text-center">
          <Button href="/contact?intent=consultation" variant="secondary" arrow>
            Book a Free Consultation
          </Button>
          <p className="mt-3 text-[11px] text-text-muted">
            Add verified business registration, certifications, partner
            factories, and payment protection details before launch.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
