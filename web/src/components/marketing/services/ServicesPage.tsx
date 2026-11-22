import ServicesHero from "@/components/marketing/services/ServicesHero";
import ServiceSection from "@/components/marketing/services/ServiceSection";
import LaunchPackages from "@/components/marketing/services/LaunchPackages";
import JourneyTimeline from "@/components/marketing/services/JourneyTimeline";
import ServicesFAQ from "@/components/marketing/services/ServicesFAQ";
import ServicesCTA from "@/components/marketing/services/ServicesCTA";
import { servicesPageContent } from "@/lib/marketing-pages";

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      {servicesPageContent.services.map((service, index) => (
        <ServiceSection
          key={service.slug}
          service={service}
          index={index}
        />
      ))}
      <LaunchPackages />
      <JourneyTimeline />
      <ServicesFAQ />
      <ServicesCTA />
    </>
  );
}
