import ContactHero from "@/components/marketing/contact/ContactHero";
import ContactForm from "@/components/marketing/contact/ContactForm";
import ContactInfo from "@/components/marketing/contact/ContactInfo";
import BookingWidget from "@/components/marketing/contact/BookingWidget";
import NextSteps from "@/components/marketing/contact/NextSteps";
import ContactFAQ from "@/components/marketing/contact/ContactFAQ";
import ContactSocial from "@/components/marketing/contact/ContactSocial";

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <section className="py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
          <div className="lg:col-span-2">
            <ContactInfo />
          </div>
        </div>
      </section>
      <BookingWidget />
      <NextSteps />
      <ContactFAQ />
      <ContactSocial />
    </>
  );
}
