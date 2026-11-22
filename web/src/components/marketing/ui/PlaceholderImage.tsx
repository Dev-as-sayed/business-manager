import Image from "next/image";
import { cn } from "@/lib/utils";
import { PlaceholderTag } from "./PlaceholderTag";

export type PlaceholderKind =
  | "factory"
  | "quality"
  | "packaging"
  | "storefront"
  | "shipping"
  | "team"
  | "map";

export const placeholderSources: Record<PlaceholderKind, string> = {
  factory: "/placeholders/factory.svg",
  quality: "/placeholders/quality.svg",
  packaging: "/placeholders/packaging.svg",
  storefront: "/placeholders/storefront.svg",
  shipping: "/placeholders/shipping.svg",
  team: "/placeholders/team.svg",
  map: "/placeholders/map.svg",
};

const explicitlyEnabled =
  process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS === "true";
const explicitlyDisabled =
  process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS === "false";
const showTags =
  explicitlyEnabled ||
  (!explicitlyDisabled && process.env.NODE_ENV !== "production");

export function PlaceholderImage({
  src,
  kind,
  alt,
  label,
  aspect = "aspect-[4/3]",
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  caption = true,
}: {
  src?: string;
  kind?: PlaceholderKind;
  alt: string;
  label: string;
  aspect?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  caption?: boolean;
}) {
  const source = src ?? (kind ? placeholderSources[kind] : placeholderSources.team);

  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line bg-surface-2",
        className,
      )}
    >
      <div className={cn("relative w-full", aspect)}>
        <Image
          src={source}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
      {showTags ? (
        <PlaceholderTag className="absolute left-3 top-3" />
      ) : null}
      {caption ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pb-4 pt-12 font-mono text-[10px] uppercase tracking-[0.18em] text-white">
          {label}
        </figcaption>
      ) : null}
    </figure>
  );
}
