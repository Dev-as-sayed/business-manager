"use client";

import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "@/context/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/60 text-ink transition-colors hover:bg-surface-2",
        className,
      )}
    >
      <FiSun aria-hidden="true" className="h-4 w-4 dark:hidden" />
      <FiMoon aria-hidden="true" className="hidden h-4 w-4 dark:block" />
    </button>
  );
}
