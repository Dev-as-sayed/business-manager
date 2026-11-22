"use client";

import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { messages } from "@/i18n/messages/en";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    formData.set("email", email);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Could not subscribe. Please try again.");
      }

      setStatus("success");
      setMessage(messages.footer.newsletterSuccess);
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not subscribe. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="newsletter-email">
          {messages.footer.newsletterPlaceholder}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={messages.footer.newsletterPlaceholder}
          className="h-12 min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-band"
        />
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-lime px-5 text-sm font-semibold text-lime-contrast transition-colors hover:bg-lime-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-band disabled:opacity-60"
        >
          {status === "loading" ? "Adding…" : messages.footer.newsletterCta}
          <FiArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <p
        aria-live="polite"
        className={`mt-2 min-h-5 text-xs ${
          status === "error" ? "text-red-300" : "text-band-muted"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
