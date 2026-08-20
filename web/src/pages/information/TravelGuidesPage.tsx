import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'
import { Icon } from '@/components/common/Icon'

export const TravelGuidesPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Resources', href: '/resources/travel-guides' },
    { label: 'Travel Preparation & Cultural Guides' },
  ]

  const tocItems = [
    { id: 'trip-prep', title: 'Trip Preparation & Essentials' },
    { id: 'packing-weather', title: 'Packing & Seasonal Weather' },
    { id: 'culture-etiquette', title: 'Local Culture & Etiquette' },
    { id: 'safety-protocols', title: 'Safety Protocols & Transport' },
    { id: 'faq', title: 'Traveler FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'Popular Places Index',
      description: 'Explore top rated regional destinations.',
      href: '/places',
      iconName: 'places' as const,
    },
    {
      title: 'Community Forum',
      description: 'Connect with verified travelers for first-hand tips.',
      href: '/community',
      iconName: 'user' as const,
    },
  ]

  const faqItems = [
    {
      question: 'What is the best season to visit coastal regions like Goa?',
      answer: 'November through February offers pleasant temperatures (20°C - 30°C) with dry sunny days, ideal for sightseeing and watersports. Monsoon season (June - September) features lush greenery and waterfalls.',
    },
    {
      question: 'Is tap water safe for drinking in remote destinations?',
      answer: 'We recommend drinking boiled, filtered, or sealed bottled water when traveling outside major hotel resorts.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'Travel Preparation & Cultural Guides',
        description: 'Comprehensive destination intelligence, seasonal weather patterns, packing checklists, and local cultural etiquette.',
        category: 'Traveler Resources',
        iconName: 'gallery',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Guidebook',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Trip Preparation */}
      <SectionCard id="trip-prep" title="Trip Preparation Essentials" iconName="gallery" badgeText="Pre-Trip Checklist">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Proper preparation guarantees a seamless, stress-free trip. Ensure you carry physical identification, active digital payments, emergency contacts, and essential prescription medications.
        </p>

        <CalloutBox type="tip" title="Digital Documentation">
          Save offline copies of your travel itinerary, hotel booking confirmations, and identification inside the Nearby PWA for instant access without cell coverage.
        </CalloutBox>
      </SectionCard>

      {/* Section 2: Packing & Seasonal Weather */}
      <SectionCard id="packing-weather" title="Packing & Seasonal Weather Insights" iconName="weather" badgeText="Weather Matrix">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          <div className="rounded-sm border border-border/60 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Icon name="weather" size="xs" className="text-amber-400" />
              <span>Dry Season (Nov - Feb)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Light cotton clothing, sun hat, UV protection sunglasses, swimwear, and comfortable walking sandals.
            </p>
          </div>

          <div className="rounded-sm border border-border/60 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Icon name="weather" size="xs" className="text-sky-400" />
              <span>Monsoon Season (Jun - Sep)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Quick-dry synthetic apparel, waterproof raincoat/umbrella, non-slip trekking boots, and waterproof phone pouch.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Local Culture & Etiquette */}
      <SectionCard id="culture-etiquette" title="Local Culture & Sacred Etiquette" iconName="places" badgeText="Cultural Respect">
        <p className="text-xs text-muted-foreground leading-relaxed">
          When visiting active religious sites such as churches, temples, or shrines, observe modest dress codes (shoulders and knees covered), remove shoes where requested, and maintain quiet reverence.
        </p>
      </SectionCard>

      {/* Section 4: Safety Protocols & Transport */}
      <SectionCard id="safety-protocols" title="Safety Protocols & Local Transport" iconName="shield" badgeText="Traveler Safety">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Utilize licensed app-based taxis or pre-negotiated scooter rentals with helmets. Always adhere to ocean safety flags on public beaches.
        </p>
      </SectionCard>

      {/* Section 5: FAQ */}
      <SectionCard id="faq" title="Traveler FAQ" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default TravelGuidesPage
