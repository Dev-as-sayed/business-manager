"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";

type Variant = "primary" | "secondary" | "gold" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover focus-visible:outline-primary",
  secondary:
    "border border-border bg-background text-text-primary hover:bg-accent focus-visible:outline-primary",
  gold: "bg-gold text-gold-foreground shadow-sm hover:brightness-95 focus-visible:outline-gold",
  ghost:
    "text-text-secondary hover:bg-accent hover:text-text-primary focus-visible:outline-primary",
  dark: "bg-launcher-ink text-white hover:bg-launcher-ink-soft focus-visible:outline-white",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm sm:text-base",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className = "",
  ariaLabel,
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
      {arrow && (
        <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      )}
    </Link>
  );
}
