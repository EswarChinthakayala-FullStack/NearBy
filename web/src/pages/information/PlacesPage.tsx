import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'

export const PlacesPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Platform', href: '/#destinations' },
    { label: 'Popular Places Index & Ranking Algorithm' },
  ]

  const tocItems = [
    { id: 'curation', title: 'Destination Curation' },
    { id: 'ranking-algorithm', title: 'Ranking & Scoring Algorithm' },
    { id: 'review-verification', title: 'Review Integrity & Verification' },
    { id: 'insights', title: 'Travel Insights & Media Standards' },
    { id: 'faq', title: 'Places Index FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'Location Security',
      description: 'Understand how GPS telemetry is anonymized for distance calculations.',
      href: '/location-security',
      iconName: 'shield' as const,
    },
    {
      title: 'AI Itinerary Planner',
      description: 'See how featured places are scheduled into multi-stop travel plans.',
      href: '/ai-itinerary',
      iconName: 'route' as const,
    },
  ]

  const faqItems = [
    {
      question: 'How are places added to the Nearby database?',
      answer: 'Places are gathered via official regional tourism registries, verified user suggestions, and licensed geographic datasets. Each venue undergoes manual or AI verification before indexation.',
    },
    {
      question: 'Can business owners pay for higher destination rankings?',
      answer: 'No. Nearby operates on a zero-sponsored-bias ranking policy. Ranking scores are computed strictly by authentic review signals, spatial proximity, and verified popularity metrics.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'Popular Places Index & Ranking Algorithm',
        description: 'Discover how Nearby indexes, verifies, ranks, and curates regional destinations using multi-signal quality scoring.',
        category: 'Destination Data',
        iconName: 'places',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Enterprise',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Curation */}
      <SectionCard id="curation" title="Destination Curation Standards" iconName="places" badgeText="Quality Control">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Every destination indexed on Nearby undergoes continuous automated health checks and verification to ensure accurate coordinates, operational status, opening hours, and high-resolution media representation.
        </p>

        <CalloutBox type="success" title="Zero Sponsored Bias Guarantee">
          Our destination ranking algorithm is 100% organic and meritocratic. Commercial venues cannot purchase top positions or fake review scores.
        </CalloutBox>
      </SectionCard>

      {/* Section 2: Ranking Algorithm */}
      <SectionCard id="ranking-algorithm" title="Multi-Signal Scoring Algorithm" iconName="star" badgeText="Score Breakdown">
        <p className="text-xs text-muted-foreground leading-relaxed">
          The Nearby Quality Index (NQI) calculates a destination score out of 5.0 based on five weighted dimensions:
        </p>

        <div className="space-y-3 my-4">
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <span className="font-semibold text-foreground">Verified Customer Rating & Volume</span>
            <span className="font-mono text-xs font-bold text-emerald-400">30% Weight</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <span className="font-semibold text-foreground">Spatial Accessibility & Transit Convenience</span>
            <span className="font-mono text-xs font-bold text-amber-400">25% Weight</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <span className="font-semibold text-foreground">Operational Freshness & Hours Accuracy</span>
            <span className="font-mono text-xs font-bold text-emerald-400">20% Weight</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <span className="font-semibold text-foreground">Media Resolution & Imagery Authenticity</span>
            <span className="font-mono text-xs font-bold text-sky-400">15% Weight</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <span className="font-semibold text-foreground">Safety & Environmental Standards</span>
            <span className="font-mono text-xs font-bold text-indigo-400">10% Weight</span>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Review Verification */}
      <SectionCard id="review-verification" title="Review Integrity & Moderation" iconName="shield" badgeText="Anti-Fraud">
        <p className="text-xs text-muted-foreground leading-relaxed">
          To prevent review manipulation and bot spam, user ratings are subjected to geographic verification algorithms that check whether a reviewer was physically in proximity to the location during the review window.
        </p>
      </SectionCard>

      {/* Section 4: Insights & Media Standards */}
      <SectionCard id="insights" title="Travel Insights & Media Standards" iconName="gallery" badgeText="High Res Imagery">
        <p className="text-xs text-muted-foreground leading-relaxed">
          All images showcased on place cards are normalized, metadata-cleaned, and ranked by clarity and resolution to give travelers an authentic preview of each site.
        </p>
      </SectionCard>

      {/* Section 5: FAQ */}
      <SectionCard id="faq" title="Places Index FAQ" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default PlacesPage
