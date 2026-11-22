import Button from "@/components/marketing/Button";

export default function LegalPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: { heading: string; body: string[]; id?: string }[];
}) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          Legal
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-text-secondary">
          {description}
        </p>

        <div className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm leading-relaxed text-text-secondary">
          <strong className="font-semibold text-text-primary">
            Placeholder:
          </strong>{" "}
          This page is a placeholder. Add the final legal copy and have it
          reviewed before launch.
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <div key={section.heading} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-text-primary">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-2 text-sm leading-relaxed text-text-secondary"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/contact" arrow>
            Contact us
          </Button>
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>
      </div>
    </section>
  );
}
