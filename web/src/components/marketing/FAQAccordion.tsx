"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import Link from "next/link";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { faqs } from "@/lib/marketing-content";

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            title="Questions Founders Ask Before Launching"
          />
        </Reveal>

        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${index}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-text-primary sm:text-base">
                    {faq.question}
                  </span>
                  <FiChevronDown
                    className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`faq-panel-${index}`}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
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

        <Reveal className="mt-6 text-center">
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
