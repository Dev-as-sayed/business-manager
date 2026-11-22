"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { PlaceholderImage } from "@/components/marketing/ui/PlaceholderImage";
import { PlaceholderTag } from "@/components/marketing/ui/PlaceholderTag";
import { stories } from "@/content/home";
import { ctaLinks } from "@/content/site";

export function ShowcaseCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update]);

  const scroll = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 20 : el.clientWidth * 0.85;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-center justify-end gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canPrev}
            aria-label="Previous example"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canNext}
            aria-label="Next example"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <FiArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={update}
        tabIndex={0}
        role="region"
        aria-label="Illustrative launch examples"
        className="no-scrollbar mt-5 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto pb-3"
      >
        {stories.map((story) => (
          <article
            key={story.brand}
            data-card
            className="h-full w-[86%] shrink-0 snap-start sm:w-[47%] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
              <div className="p-2 pb-0">
                <PlaceholderImage
                  src={story.image}
                  alt={story.alt}
                  label="Placeholder product image"
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 47vw, 86vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-muted">
                    {story.category}
                  </p>
                  <PlaceholderTag label="Example" />
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.025em] text-ink">
                  {story.brand}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {story.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-line px-2 py-0.5 text-[10px] font-medium text-ink-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {story.whatWeDid}
                </p>
                <Link
                  href={ctaLinks.start}
                  className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4 hover:decoration-ink"
                >
                  Start a similar launch
                  <FiArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
