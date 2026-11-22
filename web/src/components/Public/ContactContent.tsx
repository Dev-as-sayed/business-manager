"use client";

import { useState } from "react";
import {
  FiClock,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiSend,
} from "react-icons/fi";
import Reveal from "@/components/Public/Reveal";
import { useToast } from "@/context/ToastProvider";

const CONTACT_EMAIL = "hello@omnia.amsayed.store";

const info = [
  {
    icon: FiMail,
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: FiMapPin,
    label: "Based in",
    value: "China — shipping worldwide",
  },
  {
    icon: FiClock,
    label: "Response time",
    value: "Within 1 business day",
  },
];

const faqs = [
  {
    question: "Do I need technical skills?",
    answer:
      "No. The AI website builder generates your site from a prompt, and our team handles sourcing, logistics, and setup.",
  },
  {
    question: "How long does a launch take?",
    answer:
      "Your website can be live in minutes. Sourcing and shipping timelines depend on the product, and we share a plan up front.",
  },
  {
    question: "Can you ship to my country?",
    answer:
      "Yes. We coordinate door-to-door delivery from China to customers worldwide, including customs and last-mile.",
  },
];

export default function ContactContent() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const update = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(
      form.subject || `New launch enquiry from ${form.name}`,
    );
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    toast("success", "Opening your email client to send the message…");
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-24">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-wide text-primary">
              Contact
            </span>
            <h1 className="mt-3 text-4xl font-bold text-text-primary sm:text-5xl">
              Let&apos;s Launch Something Great
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary">
              Tell us about your idea, your product, or your goals. We&apos;ll get
              back to you with a clear path to launch.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Form + info */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8"
            >
              <h2 className="text-xl font-semibold text-text-primary">
                Send a Message
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Fill in the form and your email client will open with everything
                ready to send.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-text-secondary"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-text-secondary"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@company.com"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="subject"
                  className="mb-1 block text-sm font-medium text-text-secondary"
                >
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={form.subject}
                  onChange={update("subject")}
                  placeholder="What would you like to launch?"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="message"
                  className="mb-1 block text-sm font-medium text-text-secondary"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={update("message")}
                  placeholder="Tell us about your idea, product, and timeline…"
                  className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-hover sm:w-auto"
              >
                <FiSend className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="space-y-4">
              {info.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">
                      {item.label}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-1 block text-sm text-text-secondary transition hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className="mt-1 text-sm text-text-secondary">
                        {item.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-border bg-secondary-background p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <FiGlobe className="h-4 w-4 text-primary" />
                  The China Bridge
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  Our on-the-ground presence in China gives you direct sourcing
                  and reliable door-to-door logistics.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-secondary-background/50 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold text-text-primary">
              Common Questions
            </h2>
          </Reveal>
          <div className="mt-10 space-y-4">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 0.08}>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <h3 className="font-semibold text-text-primary">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {faq.answer}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
