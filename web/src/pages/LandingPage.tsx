import React from 'react'
import { PageTransition } from '@/components/common/PageTransition'
import { HeroSection } from '@/components/landing/HeroSection'
import { TrustedBySection } from '@/components/landing/TrustedBySection'
import { FeatureHighlights } from '@/components/landing/FeatureHighlights'
import { CategoryExplorer } from '@/components/landing/CategoryExplorer'
import { PopularDestinations } from '@/components/landing/PopularDestinations'
import { CategoryGrid } from '@/components/landing/CategoryGrid'
import { FeaturedPlaces } from '@/components/landing/FeaturedPlaces'
import { AICompanionSection } from '@/components/landing/AICompanionSection'
import { SmartPlanningSection } from '@/components/landing/SmartPlanningSection'
import { InteractiveMapPreview } from '@/components/landing/InteractiveMapPreview'
import { NearbyFeatures } from '@/components/landing/NearbyFeatures'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { TravelExperienceSection } from '@/components/landing/TravelExperienceSection'
import { StatisticsSection } from '@/components/landing/StatisticsSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { TechnologySection } from '@/components/landing/TechnologySection'
import { SafetySection } from '@/components/landing/SafetySection'
import { CTASection } from '@/components/landing/CTASection'

export const LandingPage: React.FC = () => {
  return (
    <PageTransition>
      <main className="min-h-screen bg-background text-foreground space-y-12 pb-16">
        <HeroSection />
        <TrustedBySection />
        <FeatureHighlights />
        <CategoryExplorer />
        <PopularDestinations />
        <CategoryGrid />
        <FeaturedPlaces />
        <AICompanionSection />
        <SmartPlanningSection />
        <InteractiveMapPreview />
        <NearbyFeatures />
        <HowItWorks />
        <TravelExperienceSection />
        <StatisticsSection />
        <FAQSection />
        <HowItWorksSection />
        <TechnologySection />
        <SafetySection />
        <CTASection />
      </main>
    </PageTransition>
  )
}

export default LandingPage
