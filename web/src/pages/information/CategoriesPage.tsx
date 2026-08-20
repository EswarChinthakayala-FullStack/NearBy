import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'
import { Icon, type IconName } from '@/components/common/Icon'

export const CategoriesPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Platform', href: '/#categories' },
    { label: 'Tourism Categories & Discovery Taxonomy' },
  ]

  const tocItems = [
    { id: 'taxonomy', title: 'Category Taxonomy' },
    { id: 'supported-types', title: 'Supported Category Matrix' },
    { id: 'ai-grouping', title: 'AI Automated Classification' },
    { id: 'filtering', title: 'Multi-Dimensional Filtering' },
    { id: 'faq', title: 'Category Taxonomy FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'Popular Places Index',
      description: 'See how places are curated within each category.',
      href: '/places',
      iconName: 'places' as const,
    },
    {
      title: 'AI Search Engine',
      description: 'Learn how natural language queries map to category filters.',
      href: '/features/ai-search',
      iconName: 'sparkles' as const,
    },
  ]

  const categoryMatrix: { name: string; desc: string; icon: IconName; count: string }[] = [
    { name: 'Heritage & Culture', desc: 'Ancient forts, UNESCO monuments, museums, and Latin Quarter walks.', icon: 'places', count: '142 Places' },
    { name: 'Coastal & Watersports', desc: 'Pristine beaches, scuba diving, kayaking, and sunset cruises.', icon: 'location', count: '98 Places' },
    { name: 'Culinary & Dining', desc: 'Traditional Goan shacks, fine-dining seafood, and artisanal cafes.', icon: 'grid', count: '215 Places' },
    { name: 'Nature & Wildlife', desc: 'Waterfalls, spice plantations, bird sanctuaries, and forest treks.', icon: 'map', count: '64 Places' },
    { name: 'Nightlife & Lounges', desc: 'Beach clubs, live music venues, night markets, and cocktail lounges.', icon: 'sparkles', count: '87 Places' },
    { name: 'Wellness & Retreats', desc: 'Yoga centers, Ayurvedic spas, meditation retreats, and quiet spots.', icon: 'star', count: '45 Places' },
  ]

  const faqItems = [
    {
      question: 'Can a single destination belong to multiple categories?',
      answer: 'Yes. Nearby utilizes multi-label vector classification. For instance, Aguada Fort is categorized under both Heritage & Culture and Coastal Scenic Overlooks.',
    },
    {
      question: 'How often is the category taxonomy updated?',
      answer: 'Category embeddings and place metadata are re-indexed daily using automated crawler telemetry and verified user contributions.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'Tourism Categories & Discovery Taxonomy',
        description: 'Explore Nearby\'s standardized classification framework, automated AI tagging, and multi-dimensional category search.',
        category: 'Platform Architecture',
        iconName: 'grid',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Enterprise',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Taxonomy */}
      <SectionCard id="taxonomy" title="Taxonomy Framework" iconName="grid" badgeText="Standardized Schema">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Nearby indexes places under a structured, hierarchical category tree that balances broad exploration with deep niche discovery.
        </p>

        <CalloutBox type="tip" title="Dynamic Taxonomy Expansion">
          In addition to static root categories, our AI engine dynamically clusters micro-categories like "Goan Portuguese Bakery" or "Deep Sea Wreck Scuba".
        </CalloutBox>
      </SectionCard>

      {/* Section 2: Supported Category Matrix */}
      <SectionCard id="supported-types" title="Supported Category Matrix" iconName="places" badgeText="Indexed Categories">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-2">
          {categoryMatrix.map((cat) => (
            <div
              key={cat.name}
              className="rounded-sm border border-border/80 bg-card/60 p-4 backdrop-blur-md space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/20">
                  <Icon name={cat.icon} size="sm" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-sm border border-border">
                  {cat.count}
                </span>
              </div>
              <h4 className="text-sm font-bold font-heading text-foreground">{cat.name}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 3: AI Automated Classification */}
      <SectionCard id="ai-grouping" title="AI Automated Classification" iconName="sparkles" badgeText="Auto-Tagging">
        <p className="text-xs text-muted-foreground leading-relaxed">
          When a new venue or landmark is ingested into the Nearby network, our computer vision and text analysis models evaluate photos, customer reviews, and official registry documentation to automatically assign verified category tags.
        </p>
      </SectionCard>

      {/* Section 4: Multi-Dimensional Filtering */}
      <SectionCard id="filtering" title="Multi-Dimensional Filtering" iconName="filter" badgeText="Filter Mechanics">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Categories can be combined with distance radii, price range limits, star ratings, accessibility features, and live opening status to yield precise results.
        </p>
      </SectionCard>

      {/* Section 5: FAQ */}
      <SectionCard id="faq" title="Category Taxonomy FAQ" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default CategoriesPage
