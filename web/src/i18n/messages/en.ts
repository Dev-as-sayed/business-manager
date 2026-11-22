export const messages = {
  nav: {
      home: "Home",
      about: "About",
      services: "Services",
      contact: "Contact",
      start: "Start Your Brand",
      quote: "Get a Free Product Quote",
      consultation: "Book a Free Consultation",
      menu: "Menu",
      close: "Close menu",
      language: "Language",
      theme: "Toggle color theme",
    },
    footer: {
      newsletterTitle: "One useful launch email a month.",
      newsletterBody:
        "Factory tips, product ideas, and practical launch notes. No noise.",
      newsletterPlaceholder: "Your email address",
      newsletterCta: "Subscribe",
      newsletterSuccess: "You're on the list. Watch your inbox.",
      pages: "Pages",
      services: "Services",
      contact: "Contact",
      legal: "Legal",
      terms: "Terms",
      privacy: "Privacy",
      rights: "All rights reserved.",
      placeholderNote:
        "Contact details, social links, and app badges are placeholders.",
      appSoon: "App coming soon",
    },
    common: {
      learnMore: "Learn more",
      getStarted: "Start Your Brand",
      quote: "Get a Free Product Quote",
      consultation: "Book a Free Consultation",
      placeholder: "Placeholder",
      placeholderMetric: "Placeholder metric",
      illustrativeSample: "Illustrative sample",
      backHome: "Back to home",
    },
} as const;

export type Messages = typeof messages;
