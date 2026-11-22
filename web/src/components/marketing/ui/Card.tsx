import { cn } from "@/lib/utils";

type CardVariant = "default" | "featured" | "quiet";

export function Card({
  children,
  variant = "default",
  className,
  icon,
}: {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border p-6 transition-all duration-200 md:p-8",
        variant === "default" &&
          "border-line bg-surface hover:-translate-y-0.5 hover:border-lime/40 hover:shadow-lift",
        variant === "featured" &&
          "border-lime/50 bg-lime-soft hover:-translate-y-0.5 hover:border-lime hover:shadow-lift",
        variant === "quiet" &&
          "border-line/70 bg-surface-2/40 hover:-translate-y-0.5 hover:border-line hover:shadow-soft",
        className,
      )}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="mb-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-soft text-ink [&>svg]:h-5 [&>svg]:w-5"
        >
          {icon}
        </span>
      ) : null}
      {children}
    </article>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "font-display text-xl font-semibold tracking-[-0.025em] text-ink",
        className,
      )}
    >
      {children}
    </h3>
  );
}

export function CardText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mt-2 text-sm leading-relaxed text-ink-muted md:text-[0.9375rem]",
        className,
      )}
    >
      {children}
    </p>
  );
}
