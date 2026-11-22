import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "inverse"
  | "dark"
  | "ghost"
  | "link"
  | "onLime";

type Size = "sm" | "md" | "lg";

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  arrow?: boolean;
  fullWidth?: boolean;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  type?: never;
  disabled?: never;
  loading?: never;
};

type ButtonProps = CommonProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
};

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-55";

const variants: Record<Variant, string> = {
  primary:
    "bg-lime text-lime-contrast shadow-[0_10px_30px_-16px_rgba(200,241,105,0.9)] hover:bg-lime-strong active:translate-y-px",
  secondary:
    "border border-line bg-transparent text-ink hover:border-ink/30 hover:bg-surface-2",
  inverse:
    "border border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
  dark: "bg-band text-white hover:bg-band-surface",
  ghost: "text-ink hover:bg-surface-2",
  onLime:
    "border border-lime-contrast/30 bg-transparent text-lime-contrast hover:border-lime-contrast/60 hover:bg-lime-contrast/10",
  link: "rounded-none p-0 text-ink underline decoration-lime decoration-2 underline-offset-4 hover:decoration-ink focus-visible:ring-offset-0",
};

const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-7 text-base",
};

function content(children: React.ReactNode, arrow: boolean) {
  return (
    <>
      {children}
      {arrow ? (
        <FiArrowRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      ) : null}
    </>
  );
}

export function Button(props: LinkProps | ButtonProps) {
  const {
    children,
    variant = "primary",
    size = "md",
    className,
    arrow = false,
    fullWidth = false,
  } = props;

  const classes = cn(
    base,
    variant === "link" ? "" : sizes[size],
    variants[variant],
    fullWidth && "w-full",
    className,
  );

  if (props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          onClick={props.onClick}
          target="_blank"
          rel="noreferrer"
          className={classes}
        >
          {content(children, arrow)}
        </a>
      );
    }

    return (
      <Link href={props.href} onClick={props.onClick} className={classes}>
        {content(children, arrow)}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
      disabled={props.disabled || props.loading}
      aria-busy={props.loading || undefined}
      className={classes}
    >
      {props.loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {content(children, arrow)}
    </button>
  );
}
