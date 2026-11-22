import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
  className,
  titleClassName,
  as: Heading = "h2",
  id,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  tone?: "default" | "inverse";
  className?: string;
  titleClassName?: string;
  as?: "h1" | "h2" | "h3";
  id?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Eyebrow tone={tone} className="mb-4">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Heading
        id={id}
        className={cn(
          "type-h2 font-semibold",
          tone === "inverse" ? "text-white" : "text-ink",
          titleClassName,
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-[1.65] text-pretty md:text-lg",
            tone === "inverse" ? "text-band-muted" : "text-ink-muted",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
