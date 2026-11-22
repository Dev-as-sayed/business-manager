"use client";

import { FiCheckCircle, FiX } from "react-icons/fi";
import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { primaryCta } from "@/lib/marketing-content";
import { aboutContent } from "@/lib/marketing-pages";

export default function ProblemSolveGrid() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="The problem we solve"
            title="The Gap Between a Good Idea and a Real Product"
            description="Most launches fail in the handoffs. We built one team to remove them."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {aboutContent.problemsFixes.map((item, index) => (
            <Reveal key={item.problem} delay={(index % 3) * 0.08}>
              <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                    <FiX className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-base font-semibold text-text-primary">
                    {item.problem}
                  </h3>
                </div>
                <div className="my-4 h-px w-full bg-border" />
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-action/10 text-action">
                    <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {item.fix}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button href={primaryCta.href} arrow>
            {primaryCta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
