"use client";

import Button from "@/components/marketing/Button";
import { primaryCta, secondaryCta } from "@/lib/marketing-content";

export default function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-6xl gap-2">
        <Button
          href={primaryCta.href}
          size="sm"
          className="flex-1"
          ariaLabel={primaryCta.label}
        >
          {primaryCta.label}
        </Button>
        <Button
          href={secondaryCta.href}
          variant="secondary"
          size="sm"
          className="flex-1"
          ariaLabel={secondaryCta.label}
        >
          Get a Quote
        </Button>
      </div>
    </div>
  );
}
