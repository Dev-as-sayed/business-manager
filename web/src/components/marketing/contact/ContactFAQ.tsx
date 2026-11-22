"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { contactPageContent } from "@/lib/marketing-pages";

export default function ContactFAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section className="border-t border-border bg-secondary-background/60 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Mini FAQ"
            title="A Few Things You Might Be Wondering"
            description="Answers are placeholders — confirm final policies before launch."
          />
        </Reveal>

        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
          {contactPageContent.faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`contact-faq-${index}`}
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
                      id={`contact-faq-${index}`}
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
      </div>
    </section>
  );
}
