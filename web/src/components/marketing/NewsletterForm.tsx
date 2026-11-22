"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="mt-6 max-w-sm">
      <label htmlFor="newsletter" className="block text-sm font-semibold text-white">
        Launch notes, monthly
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="newsletter"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@brand.com"
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-gold-foreground transition hover:brightness-95"
        >
          <FiSend className="h-4 w-4" aria-hidden="true" />
          Join
        </button>
      </div>
      <p aria-live="polite" className="mt-2 min-h-4 text-xs text-gold">
        {subscribed && "You're on the list — thanks for joining."}
      </p>
      <p className="mt-1 text-[11px] text-white/40">
        Newsletter signup is a placeholder until an email provider is connected.
      </p>
    </form>
  );
}
