"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Icon from "@/components/marketing/Icon";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { personas } from "@/lib/marketing-content";

export default function PersonaCards() {
  return (
    <section className="border-y border-border bg-secondary-background/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Who it's for"
            title="Built for People Ready to Build Something"
            description="You bring the ambition and the audience. We bring the product, store, content, and growth engine."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {personas.map((persona, index) => (
            <Reveal key={persona.title} delay={index * 0.08}>
              <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={persona.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-text-primary">
                  {persona.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                  {persona.description}
                </p>
                <Link
                  href="/contact?intent=persona"
                  className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  This is me
                  <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
