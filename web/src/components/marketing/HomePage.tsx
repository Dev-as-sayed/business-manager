import Hero from "@/components/marketing/Hero";
import ProblemSolution from "@/components/marketing/ProblemSolution";
import ServicePillars from "@/components/marketing/ServicePillars";
import StepTimeline from "@/components/marketing/StepTimeline";
import ProductDevSpotlight from "@/components/marketing/ProductDevSpotlight";
import ChinaBridgeBand from "@/components/marketing/ChinaBridgeBand";
import SoftwarePreview from "@/components/marketing/SoftwarePreview";
import ContentShowcase from "@/components/marketing/ContentShowcase";
import ShowcaseCarousel from "@/components/marketing/ShowcaseCarousel";
import PricingTeaser from "@/components/marketing/PricingTeaser";
import PersonaCards from "@/components/marketing/PersonaCards";
import FAQAccordion from "@/components/marketing/FAQAccordion";
import CTABanner from "@/components/marketing/CTABanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <ServicePillars />
      <StepTimeline />
      <ProductDevSpotlight />
      <ChinaBridgeBand />
      <SoftwarePreview />
      <ContentShowcase />
      <ShowcaseCarousel />
      <PricingTeaser />
      <PersonaCards />
      <FAQAccordion />
      <CTABanner />
    </>
  );
}
