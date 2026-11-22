import { Button } from "@/components/marketing/ui/Button";
import { ctaLinks } from "@/content/site";
import { messages } from "@/i18n/messages/en";

export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
      <div aria-hidden="true" className="caution-stripe h-1 w-full" />
      <nav
        aria-label="Quick actions"
        className="border-t border-line bg-paper/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md"
      >
        <div className="flex gap-2">
          <Button href={ctaLinks.start} size="sm" className="flex-1" arrow>
            {messages.nav.start}
          </Button>
          <Button
            href={ctaLinks.quote}
            size="sm"
            variant="secondary"
            className="flex-1"
          >
            Free Quote
          </Button>
        </div>
      </nav>
    </div>
  );
}
