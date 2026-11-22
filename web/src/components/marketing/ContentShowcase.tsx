"use client";

import { FiArrowRight } from "react-icons/fi";
import PlaceholderImage from "@/components/marketing/PlaceholderImage";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import Button from "@/components/marketing/Button";
import { contentShowcase, marketingMetrics } from "@/lib/marketing-content";

export default function ContentShowcase() {
  return (
    <section id="resources" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Content & marketing"
            title="Content That Makes People Stop and Buy"
            description="Product photos, short-form video, ad creatives, and social content — produced by a team that already knows your product."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {contentShowcase.map((item, index) => (
            <Reveal key={item.title} delay={(index % 4) * 0.08}>
              <article className="h-full rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {item.type}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <PlaceholderImage
                    label="Before"
                    hint={item.before}
                    aspect="aspect-square"
                    className="rounded-xl p-2"
                  />
                  <PlaceholderImage
                    label="After"
                    hint={item.after}
                    aspect="aspect-square"
                    className="rounded-xl p-2"
                  />
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft sm:grid-cols-3">
            {marketingMetrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs font-medium text-text-muted">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-text-muted">
            Sample metrics — replace with verified campaign results.
          </p>
        </Reveal>

        <Reveal className="mt-8 text-center">
          <Button href="/contact?intent=content" variant="secondary" arrow>
            Get Content That Converts
          </Button>
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-text-muted">
            <FiArrowRight className="h-3 w-3" aria-hidden="true" />
            Content packs are available as a standalone service.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
