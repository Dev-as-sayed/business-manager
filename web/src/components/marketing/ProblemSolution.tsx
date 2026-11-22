"use client";

import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiX } from "react-icons/fi";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { problems, solutions } from "@/lib/marketing-content";

export default function ProblemSolution() {
  return (
    <section className="border-y border-border bg-secondary-background/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="The difference"
            title="Stop Managing Five Vendors. Start Building One Brand."
            description="Launching a product used to mean juggling separate suppliers, designers, developers, shippers, and marketers. We replaced that with one team and one timeline."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
                  <FiX className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold text-text-primary">
                  The old way
                </h3>
              </div>
              <ul className="mt-5 space-y-3">
                {problems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-text-secondary"
                  >
                    <FiX
                      className="mt-0.5 h-4 w-4 shrink-0 text-danger"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
                Result: delays, hidden costs, and miscommunication.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl border-2 border-primary/30 bg-card p-6 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FiCheckCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold text-text-primary">
                  The Brand Launcher way
                </h3>
              </div>
              <ul className="mt-5 space-y-3">
                {solutions.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-text-secondary"
                  >
                    <FiCheckCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-action"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="#how-it-works"
                className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
              >
                See how it works
                <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
