import Link from "next/link";
import { FaRocket } from "react-icons/fa";

export default function Logo({
  variant = "default",
}: {
  variant?: "default" | "light";
}) {
  const light = variant === "light";

  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label="The Brand Launcher home"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-md">
        <FaRocket className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
          The Brand
        </span>
        <span
          className={`block text-lg font-bold ${light ? "text-white" : "text-text-primary"}`}
        >
          Launcher
        </span>
      </span>
    </Link>
  );
}
