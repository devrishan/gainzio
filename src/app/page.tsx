import { ComplianceDashboard } from "@/components/marketing/ComplianceDashboard";
import { EarningStreams } from "@/components/marketing/EarningStreams";
import { FAQSection } from "@/components/marketing/FAQSection";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Navbar } from "@/components/marketing/Navbar";
import { PayoutPulse } from "@/components/marketing/PayoutPulse";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { WhoItIsFor } from "@/components/marketing/WhoItIsFor";
import { WhyDifferent } from "@/components/marketing/WhyDifferent";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col gap-0 bg-background text-foreground overflow-x-hidden" suppressHydrationWarning>
        <Hero />
        <HowItWorks />
        <EarningStreams />
        <PayoutPulse />
        <WhoItIsFor />
        <WhyDifferent />
        <ComplianceDashboard />
        <FAQSection />
        <TrustStrip />
        <SiteFooter />
      </main>
    </>
  );
}

