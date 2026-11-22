"use client";

import * as React from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiMonitor,
  FiPaperclip,
  FiPhone,
  FiSearch,
  FiShield,
  FiTool,
  FiTrash2,
  FiYoutube,
  FiPackage,
} from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/marketing/ui/Button";
import { Card } from "@/components/marketing/ui/Card";
import { Container } from "@/components/marketing/ui/Container";
import { CtaPanel } from "@/components/marketing/ui/CtaPanel";
import { Eyebrow } from "@/components/marketing/ui/Eyebrow";
import { FAQAccordion } from "@/components/marketing/ui/FAQAccordion";
import { FaqJsonLd } from "@/components/marketing/ui/JsonLd";
import { PlaceholderImage } from "@/components/marketing/ui/PlaceholderImage";
import { SectionHeading } from "@/components/marketing/ui/SectionHeading";
import { ServiceIcon } from "@/components/marketing/ui/ServiceIcon";
import { services } from "@/content/services";
import { budgetOptions, nextSteps, projectTypes } from "@/content/contact";
import { contactFaqs } from "@/content/faqs";
import { ctaLinks, site } from "@/content/site";
import { cn } from "@/lib/utils";

const projectChoices = [
  { value: "sourcing", label: "Sourcing", icon: FiSearch },
  { value: "custom-product", label: "Custom product", icon: FiTool },
  { value: "website", label: "Website", icon: FiMonitor },
  { value: "full-launch", label: "Full launch", icon: FiPackage },
];

const socialIcons: Record<string, React.ReactNode> = {
  instagram: <FiInstagram aria-hidden="true" className="h-4 w-4" />,
  linkedin: <FiLinkedin aria-hidden="true" className="h-4 w-4" />,
  youtube: <FiYoutube aria-hidden="true" className="h-4 w-4" />,
  x: <FaXTwitter aria-hidden="true" className="h-4 w-4" />,
};

const fieldClass =
  "h-12 w-full rounded-xl border border-line bg-surface-2/40 px-3.5 text-sm text-ink placeholder:text-ink-muted/60 transition-colors focus:border-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

const labelClass = "mb-1.5 block text-sm font-medium text-ink";

type FormValues = {
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  services: string[];
  project: string;
  budget: string;
  message: string;
  consent: boolean;
};

type FormErrors = Partial<
  Record<
    "name" | "email" | "country" | "services" | "project" | "message" | "consent",
    string
  >
>;

const initialValues: FormValues = {
  name: "",
  email: "",
  whatsapp: "",
  country: "",
  services: [],
  project: "",
  budget: "",
  message: "",
  consent: false,
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-red-700 dark:text-red-400">
      {message}
    </p>
  );
}

function ContactForm() {
  const [values, setValues] = React.useState<FormValues>(initialValues);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [status, setStatus] = React.useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [fileKey, setFileKey] = React.useState(0);

  React.useEffect(() => {
    const project = new URLSearchParams(window.location.search).get("project");
    if (project && projectTypes.some((type) => type.value === project)) {
      setValues((current) => ({ ...current, project }));
    }
  }, []);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const toggleService = (id: string) => {
    setValues((current) => ({
      ...current,
      services: current.services.includes(id)
        ? current.services.filter((item) => item !== id)
        : [...current.services, id],
    }));
    setErrors((current) => ({ ...current, services: undefined }));
  };

  const validate = () => {
    const next: FormErrors = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!values.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!values.country) next.country = "Please select your country.";
    if (values.services.length === 0) {
      next.services = "Select at least one service.";
    }
    if (!values.project) next.project = "Select a project type.";
    if (!values.message.trim()) {
      next.message = "Tell us a little about your project.";
    }
    if (!values.consent) {
      next.consent = "Please accept the privacy policy to continue.";
    }
    return next;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setFile(null);
    setFileError(null);
    setFileKey((key) => key + 1);
    setStatus("idle");
    window.setTimeout(() => document.getElementById("name")?.focus(), 0);
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) {
      setFile(null);
      setFileError(null);
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setFile(null);
      setFileError("File is too large. Maximum size is 10MB.");
      return;
    }

    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];
    if (!allowed.includes(selected.type)) {
      setFile(null);
      setFileError("Use a PDF, PNG, JPG, or WEBP file.");
      return;
    }

    setFile(selected);
    setFileError(null);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const order: (keyof FormErrors)[] = [
        "name",
        "email",
        "country",
        "services",
        "project",
        "message",
        "consent",
      ];
      const firstError = order.find((key) => nextErrors[key]);
      if (firstError) {
        document
          .querySelector<HTMLElement>(`[name="${firstError}"]`)
          ?.focus();
      }
      return;
    }

    if (fileError) {
      document.getElementById("brief-file")?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, fileName: file?.name ?? null }),
      });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-start"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-lime-contrast">
          <FiCheck aria-hidden="true" className="h-6 w-6" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
          Brief received.
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
          Thanks, {values.name.split(" ")[0] || "there"}. A real person will
          review your project and reply within 24 hours.
        </p>
        <Button onClick={reset} variant="secondary" className="mt-6">
          Send another brief
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name <span className="text-ink-muted">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(fieldClass, errors.name && "border-danger")}
          />
          <FieldError id="name-error" message={errors.name} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email <span className="text-ink-muted">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(fieldClass, errors.email && "border-danger")}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div>
          <label htmlFor="whatsapp" className={labelClass}>
            WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            value={values.whatsapp}
            onChange={(event) => update("whatsapp", event.target.value)}
            placeholder="+00 000 000 0000"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="country" className={labelClass}>
            Country <span className="text-ink-muted">*</span>
          </label>
          <div className="relative">
            <select
              id="country"
              name="country"
              autoComplete="country"
              required
              value={values.country}
              onChange={(event) => update("country", event.target.value)}
              aria-invalid={Boolean(errors.country)}
              aria-describedby={errors.country ? "country-error" : undefined}
              className={cn(
                fieldClass,
                "cursor-pointer appearance-none pr-10",
                errors.country && "border-danger",
              )}
            >
              <option value="">Select country</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="OTHER">Other</option>
            </select>
            <FiChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
            />
          </div>
          <FieldError id="country-error" message={errors.country} />
        </div>
      </div>

      <fieldset
        aria-describedby={errors.services ? "services-error" : undefined}
      >
        <legend className={labelClass}>
          Interested services <span className="text-ink-muted">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => {
            const selected = values.services.includes(service.id);
            return (
              <label
                key={service.id}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-lime focus-within:ring-offset-2 focus-within:ring-offset-surface",
                  selected
                    ? "border-lime bg-lime-soft text-ink"
                    : "border-line bg-surface-2/40 text-ink hover:border-ink/20",
                )}
              >
                <input
                  type="checkbox"
                  name="services"
                  value={service.id}
                  checked={selected}
                  onChange={() => toggleService(service.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    selected
                      ? "bg-lime text-lime-contrast"
                      : "bg-surface text-ink-muted",
                  )}
                >
                  <ServiceIcon service={service.id} className="h-4 w-4" />
                </span>
                <span className="min-w-0 truncate">{service.shortName}</span>
                <FiCheck
                  aria-hidden="true"
                  className={cn(
                    "ml-auto h-4 w-4 shrink-0",
                    selected ? "text-lime-ink" : "text-transparent",
                  )}
                />
              </label>
            );
          })}
        </div>
        <FieldError id="services-error" message={errors.services} />
      </fieldset>

      <fieldset
        aria-describedby={errors.project ? "project-error" : undefined}
      >
        <legend className={labelClass}>
          Project type <span className="text-ink-muted">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {projectChoices.map((choice) => {
            const Icon = choice.icon;
            const selected = values.project === choice.value;
            return (
              <label
                key={choice.value}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-lime focus-within:ring-offset-2 focus-within:ring-offset-surface",
                  selected
                    ? "border-lime bg-lime-soft text-ink"
                    : "border-line bg-surface-2/40 text-ink hover:border-ink/20",
                )}
              >
                <input
                  type="radio"
                  name="project"
                  value={choice.value}
                  checked={selected}
                  onChange={() => update("project", choice.value)}
                  className="sr-only"
                />
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 shrink-0",
                    selected ? "text-lime-ink" : "text-ink-muted",
                  )}
                />
                {choice.label}
              </label>
            );
          })}
        </div>
        <FieldError id="project-error" message={errors.project} />
      </fieldset>

      <div>
        <label htmlFor="budget" className={labelClass}>
          Budget range
        </label>
        <div className="relative">
          <select
            id="budget"
            name="budget"
            value={values.budget}
            onChange={(event) => update("budget", event.target.value)}
            className={cn(fieldClass, "cursor-pointer appearance-none pr-10")}
          >
            <option value="">Select budget range</option>
            {budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FiChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message <span className="text-ink-muted">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Tell us about your product, market, and timeline..."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={cn(
            fieldClass,
            "min-h-32 resize-y py-3",
            errors.message && "border-danger",
          )}
        />
        <FieldError id="message-error" message={errors.message} />
      </div>

      <div>
        <label
          htmlFor="brief-file"
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-surface-2/30 px-4 py-5 text-center transition-colors hover:border-lime focus-within:border-lime focus-within:ring-2 focus-within:ring-lime/40"
        >
          <FiPaperclip aria-hidden="true" className="h-5 w-5 text-ink-muted" />
          <span className="text-sm font-medium text-ink">
            Attach a sketch or reference
          </span>
          <span className="text-xs text-ink-muted">
            Optional — PDF, PNG, JPG, or WEBP, up to 10MB
          </span>
          <input
            key={fileKey}
            id="brief-file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="sr-only"
            aria-invalid={Boolean(fileError)}
            aria-describedby={fileError ? "file-error" : undefined}
            onChange={onFileChange}
          />
        </label>
        {fileError ? (
          <p
            id="file-error"
            role="alert"
            className="mt-1.5 text-xs font-medium text-red-700 dark:text-red-400"
          >
            {fileError}
          </p>
        ) : null}
        {file ? (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-surface-2/60 px-3 py-2 text-sm">
            <span className="min-w-0 truncate text-ink">{file.name}</span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setFileError(null);
                setFileKey((key) => key + 1);
              }}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink"
              aria-label="Remove attachment"
            >
              <FiTrash2 aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="consent"
          className="flex cursor-pointer items-start gap-3 text-sm text-ink-muted"
        >
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            checked={values.consent}
            onChange={(event) => update("consent", event.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-[var(--lime-strong)]"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/privacy"
              className="font-medium text-ink underline decoration-lime decoration-2 underline-offset-4"
            >
              privacy policy
            </Link>{" "}
            and consent to being contacted about my project.
          </span>
        </label>
        <FieldError id="consent-error" message={errors.consent} />
      </div>

      {status === "error" ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        >
          Something went wrong. Please try again, or email us at {site.email}.
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </Button>
      <p className="text-center text-xs text-ink-muted">
        We reply within 24 hours. No spam, no obligation.
      </p>
    </form>
  );
}

function QuickContact() {
  const items = [
    {
      href: site.whatsappHref,
      icon: <FiMessageCircle aria-hidden="true" className="h-4 w-4" />,
      label: `WhatsApp ${site.whatsappDisplay}`,
    },
    {
      href: `mailto:${site.email}`,
      icon: <FiMail aria-hidden="true" className="h-4 w-4" />,
      label: site.email,
    },
    {
      href: site.phoneHref,
      icon: <FiPhone aria-hidden="true" className="h-4 w-4" />,
      label: site.phoneDisplay,
    },
  ];

  return (
    <Card>
      <h2 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink">
        Quick contact
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Prefer a direct line? Message us on WhatsApp or email the team.
      </p>
      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex min-h-11 items-center gap-3 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-lime hover:bg-lime-soft"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lime-soft text-ink">
              {item.icon}
            </span>
            <span className="min-w-0 truncate">{item.label}</span>
          </a>
        ))}
      </div>
    </Card>
  );
}

function Offices() {
  return (
    <Card>
      <h2 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink">
        Offices
      </h2>
      <PlaceholderImage
        kind="map"
        alt="Map placeholder showing office locations"
        label="Office map placeholder"
        aspect="aspect-[16/10]"
        className="mt-4"
        sizes="(min-width: 1024px) 33vw, 100vw"
      />
      <div className="mt-5 space-y-4">
        {site.addresses.map((address) => (
          <div key={address.id} className="flex items-start gap-3">
            <FiMapPin
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-lime-ink"
            />
            <div>
              <p className="text-sm font-semibold text-ink">{address.label}</p>
              {address.lines.map((line) => (
                <p key={line} className="text-sm leading-relaxed text-ink-muted">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WorkingHours() {
  return (
    <Card>
      <h2 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink">
        Working hours
      </h2>
      <dl className="mt-4 space-y-3">
        {site.hours.map((hour) => (
          <div
            key={hour.label}
            className="flex items-start justify-between gap-4 text-sm"
          >
            <dt className="font-medium text-ink">{hour.label}</dt>
            <dd className="text-right text-ink-muted">{hour.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
        <FiClock aria-hidden="true" className="h-3.5 w-3.5" />
        We usually reply within one business day.
      </p>
    </Card>
  );
}

function Booking() {
  return (
    <Card variant="featured" icon={<FiCalendar />}>
      <h2 className="font-display text-xl font-semibold tracking-[-0.025em] text-ink">
        Book a consultation
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Pick a 20-minute slot and we will walk through your idea, timeline, and
        the fastest route to market.
      </p>
      <Button
        href={ctaLinks.consultation}
        variant="secondary"
        fullWidth
        className="mt-5"
        arrow
      >
        Pick a time
      </Button>
      <p className="mt-3 text-xs leading-relaxed text-ink-muted">
        Cal.com / Calendly embed placeholder — the live calendar will appear
        here.
      </p>
    </Card>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <section className="pb-8 pt-12 md:pb-10 md:pt-16">
        <Container>
          <Eyebrow>Get in touch</Eyebrow>
          <h1 className="type-h1 mt-4 max-w-3xl font-semibold text-ink">
            Let&apos;s Talk About Your Brand.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-[1.65] text-ink-muted sm:text-lg">
            Tell us about your idea and we&apos;ll guide you through the fastest
            route to market.
          </p>
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {[
              { icon: <FiClock aria-hidden="true" />, label: "Reply within 24h" },
              {
                icon: <FiMessageCircle aria-hidden="true" />,
                label: "WhatsApp available",
              },
              { icon: <FiShield aria-hidden="true" />, label: "Free quote" },
            ].map((chip) => (
              <li
                key={chip.label}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-lime-ink"
              >
                {chip.icon}
                {chip.label}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        id="project-form"
        className="scroll-mt-[calc(var(--header-h)+1.5rem)] pb-16 md:pb-24"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
            <div className="rounded-2xl border border-line bg-surface p-6 md:p-8">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                Tell us about your project
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                The more you share, the more useful our first reply will be.
                Fields marked * are required.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
              <QuickContact />
              <Offices />
              <WorkingHours />
              <Booking />
            </aside>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface/50 py-16 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="What happens next"
            title="Three steps from brief to kickoff."
            description="No long sales cycle. You get a real answer, a clear plan, and a start date."
            className="max-w-2xl"
          />
          <ol className="relative mt-10 grid gap-8 md:grid-cols-3">
            {nextSteps.map((step, index) => (
              <li key={step.title} className="relative">
                {index < nextSteps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-5 hidden h-px w-[calc(100%+2rem)] bg-line md:block"
                  />
                ) : null}
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-lime font-mono text-sm font-semibold text-lime-contrast">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <SectionHeading
                title="Quick answers before you send a brief."
                description="If your question is not here, ask us directly — we answer before you spend anything."
                className="mt-4"
              />
              <div className="mt-6 flex flex-wrap gap-2">
                {site.social.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:border-lime hover:text-ink"
                  >
                    {socialIcons[social.icon]}
                  </a>
                ))}
              </div>
            </div>
            <FAQAccordion items={contactFaqs} />
          </div>
          <FaqJsonLd items={contactFaqs} />
        </Container>
      </section>

      <CtaPanel
        variant="lime"
        eyebrow="Ready when you are"
        title="Send the brief. We will map the route."
        description="A free quote, a clear timeline, and one team accountable from factory floor to first sale."
        primaryLabel="Start Your Brand"
        primaryHref={ctaLinks.start}
        secondaryLabel="Get a Free Product Quote"
        secondaryHref={ctaLinks.quote}
        note="Free quote. Reply within 24 hours."
      />
    </div>
  );
}
