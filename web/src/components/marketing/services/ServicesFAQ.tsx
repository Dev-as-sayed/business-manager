"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { servicesPageContent } from "@/lib/marketing-pages";

export default function ServicesFAQ() {
  const [open, setOpen] = useState<string | null>("0-0");
  const reduce = useReducedMotion();

  return (
    <section className="border-y border-border bg-secondary-background/60 py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Questions, Grouped by Service"
            description="Answers are placeholders — confirm final policies before launch."
          />
        </Reveal>

        <div className="mt-10 space-y-8">
          {servicesPageContent.faqGroups.map((group, groupIndex) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                {group.title}
              </h3>
              <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
                {group.faqs.map((faq, faqIndex) => {
                  const key = `${groupIndex}-${faqIndex}`;
                  const isOpen = open === key;
                  return (
                    <div key={faq.question}>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-${key}`}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="text-sm font-semibold text-text-primary">
                          {faq.question}
                        </span>
                        <FiChevronDown
                          className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`faq-${key}`}
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={
                              reduce ? undefined : { height: 0, opacity: 0 }
                            }
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-5 text-sm leading-relaxed text-text-secondary">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <Reveal className="mt-8 text-center">
          <p className="text-sm text-text-secondary">
            Still have questions?{" "}
            <Link
              href="/contact"
              className="font-semibold text-primary hover:text-primary-hover"
            >
              Talk to our team
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
