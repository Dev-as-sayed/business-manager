"use client";

import { useRef, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiPaperclip,
  FiSend,
} from "react-icons/fi";
import { contact } from "@/lib/marketing-content";
import { contactPageContent } from "@/lib/marketing-pages";

type Status = "idle" | "submitting" | "success" | "error";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  country: "",
  projectType: "",
  budget: "",
  message: "",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary";
const inputErrorClass = "border-danger focus:ring-danger";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startedAt = useRef(Date.now());

  const [values, setValues] = useState(initialValues);
  const [services, setServices] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const setValue = (key: keyof typeof initialValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const toggleService = (option: string) => {
    setServices((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        file: "File must be 10MB or smaller.",
      }));
      event.target.value = "";
      setFileName(null);
      return;
    }
    setErrors((prev) => ({ ...prev, file: "" }));
    setFileName(
      `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`,
    );
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!values.email.trim()) {
      next.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!values.projectType) next.projectType = "Please choose a project type.";
    if (!values.message.trim()) {
      next.message = "Please tell us about your project.";
    } else if (values.message.trim().length < 10) {
      next.message = "Please add a little more detail (at least 10 characters).";
    }
    const file = fileInputRef.current?.files?.[0];
    if (file && file.size > 10 * 1024 * 1024) {
      next.file = "File must be 10MB or smaller.";
    }
    return next;
  };

  const reset = () => {
    setValues(initialValues);
    setServices([]);
    setFileName(null);
    setErrors({});
    setServerError(null);
    setStatus("idle");
    startedAt.current = Date.now();
    if (fileInputRef.current) fileInputRef.current.value = "";
    formRef.current?.reset();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus("idle");
      const first = Object.keys(nextErrors)[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    setErrors({});
    setServerError(null);
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);
    formData.set("startedAt", String(startedAt.current));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(
          data.error || "Something went wrong. Please try again.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError(
        `Network error. Please try again, or email us at ${contact.email}.`,
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <section id="contact-form" className="scroll-mt-24">
        <div
          role="status"
          className="rounded-2xl border border-action/30 bg-action/5 p-8 text-center shadow-soft"
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-action/10 text-action">
            <FiCheckCircle className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-text-primary">
            Message received
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
            Thanks — we&apos;ve received your message. We reply within 24 hours
            on business days.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs text-text-muted">
            This form is connected to an API stub. Connect it to your CRM or
            email service before launch.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Send another message
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact-form" className="scroll-mt-24">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Tell us about your project
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Fields marked * are required. We reply within 24 hours.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gold sm:inline-flex">
            Free quote
          </span>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm font-medium text-text-primary"
              >
                Name *
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(event) => setValue("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                className={`${inputClass} ${errors.name ? inputErrorClass : ""}`}
                placeholder="Your name"
              />
              {errors.name && (
                <p id="contact-name-error" className="mt-1 text-xs text-danger">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-text-primary"
              >
                Email *
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => setValue("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "contact-email-error" : undefined
                }
                className={`${inputClass} ${errors.email ? inputErrorClass : ""}`}
                placeholder="you@brand.com"
              />
              {errors.email && (
                <p id="contact-email-error" className="mt-1 text-xs text-danger">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="contact-phone"
                className="block text-sm font-medium text-text-primary"
              >
                WhatsApp / phone{" "}
                <span className="text-text-muted">(optional)</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(event) => setValue("phone", event.target.value)}
                className={inputClass}
                placeholder="+1 555 000 0000"
              />
            </div>

            <div>
              <label
                htmlFor="contact-country"
                className="block text-sm font-medium text-text-primary"
              >
                Country <span className="text-text-muted">(optional)</span>
              </label>
              <input
                id="contact-country"
                name="country"
                type="text"
                autoComplete="country-name"
                value={values.country}
                onChange={(event) => setValue("country", event.target.value)}
                className={inputClass}
                placeholder="United States"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-projectType"
              className="block text-sm font-medium text-text-primary"
            >
              Project type *
            </label>
            <select
              id="contact-projectType"
              name="projectType"
              value={values.projectType}
              onChange={(event) => setValue("projectType", event.target.value)}
              aria-invalid={Boolean(errors.projectType)}
              aria-describedby={
                errors.projectType ? "contact-projectType-error" : undefined
              }
              className={`${inputClass} ${errors.projectType ? inputErrorClass : ""}`}
            >
              <option value="">Select a project type</option>
              {contactPageContent.projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.projectType && (
              <p
                id="contact-projectType-error"
                className="mt-1 text-xs text-danger"
              >
                {errors.projectType}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-text-primary">
              Interested services{" "}
              <span className="text-text-muted">(optional)</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {contactPageContent.serviceOptions.map((option) => {
                const checked = services.includes(option);
                return (
                  <label
                    key={option}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      checked
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-text-secondary hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="services"
                      value={option}
                      checked={checked}
                      onChange={() => toggleService(option)}
                      className="sr-only"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="contact-budget"
              className="block text-sm font-medium text-text-primary"
            >
              Budget range <span className="text-text-muted">(optional)</span>
            </label>
            <select
              id="contact-budget"
              name="budget"
              value={values.budget}
              onChange={(event) => setValue("budget", event.target.value)}
              className={inputClass}
            >
              <option value="">Select a budget range</option>
              {contactPageContent.budgetRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-sm font-medium text-text-primary"
            >
              Message *
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              value={values.message}
              onChange={(event) => setValue("message", event.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? "contact-message-error" : undefined
              }
              className={`${inputClass} ${errors.message ? inputErrorClass : ""}`}
              placeholder="What are you building? Share your product idea, target market, timeline, and any references."
            />
            {errors.message && (
              <p
                id="contact-message-error"
                className="mt-1 text-xs text-danger"
              >
                {errors.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-file"
              className="block text-sm font-medium text-text-primary"
            >
              Sketch or product link{" "}
              <span className="text-text-muted">(optional)</span>
            </label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                id="contact-file"
                name="file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFile}
                className="sr-only"
              />
              <label
                htmlFor="contact-file"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-accent"
              >
                <FiPaperclip className="h-4 w-4" aria-hidden="true" />
                Choose file
              </label>
              <span className="text-xs text-text-muted">
                {fileName ?? "PDF, PNG, JPG, or WEBP — max 10MB"}
              </span>
            </div>
            {errors.file && (
              <p id="contact-file-error" className="mt-1 text-xs text-danger">
                {errors.file}
              </p>
            )}
          </div>

          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />

          {status === "error" && serverError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger"
            >
              <FiAlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {serverError}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {status === "submitting" ? (
                <>
                  <FiLoader
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="h-4 w-4" aria-hidden="true" />
                  Send Message
                </>
              )}
            </button>
            <p className="max-w-xs text-[11px] text-text-muted">
              By submitting, you agree to be contacted about your project. We do
              not sell your information.
            </p>
          </div>

          <p className="text-[10px] text-text-muted">
            This form posts to an API stub. Connect it to your CRM or email
            service before launch.
          </p>
        </form>
      </div>
    </section>
  );
}
