"use client";

import Button from "@/components/marketing/Button";
import Reveal from "@/components/marketing/Reveal";
import SectionHeading from "@/components/marketing/SectionHeading";
import { primaryCta } from "@/lib/marketing-content";
import { aboutContent } from "@/lib/marketing-pages";

export default function TeamSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Meet the team"
            title="The People Behind Your Launch"
            description="A cross-functional team across sourcing, product development, software, content, marketing, and account management."
          />
        </Reveal>

        <Reveal className="mt-4 text-center">
          <span className="inline-flex rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold">
            Team profiles are placeholders — add real names, photos, and bios
          </span>
        </Reveal>

        <div className="mt-10 space-y-10">
          {aboutContent.teamGroups.map((group, groupIndex) => (
            <Reveal key={group.title} delay={groupIndex * 0.05}>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {group.title}
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {group.members.map((member) => (
                    <article
                      key={member.name}
                      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                          TM
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-primary">
                            {member.name}
                          </p>
                          <p className="truncate text-xs text-text-muted">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                        {member.bio}
                      </p>
                      <span className="mt-3 inline-flex rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                        Placeholder profile
                      </span>
                    </article>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button href={primaryCta.href} arrow>
            {primaryCta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
