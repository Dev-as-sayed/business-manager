import AboutHero from "@/components/marketing/about/AboutHero";
import StorySection from "@/components/marketing/about/StorySection";
import ProblemSolveGrid from "@/components/marketing/about/ProblemSolveGrid";
import MissionVisionValues from "@/components/marketing/about/MissionVisionValues";
import AboutChinaBridge from "@/components/marketing/about/AboutChinaBridge";
import TeamSection from "@/components/marketing/about/TeamSection";
import PromiseSection from "@/components/marketing/about/PromiseSection";
import TrustSection from "@/components/marketing/about/TrustSection";
import AboutCTA from "@/components/marketing/about/AboutCTA";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <StorySection />
      <ProblemSolveGrid />
      <MissionVisionValues />
      <AboutChinaBridge />
      <TeamSection />
      <PromiseSection />
      <TrustSection />
      <AboutCTA />
    </>
  );
}
