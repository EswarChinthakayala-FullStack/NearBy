import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'
import { Icon } from '@/components/common/Icon'

export const AISearchPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Features', href: '/#features' },
    { label: 'AI Natural Language Search' },
  ]

  const tocItems = [
    { id: 'overview', title: 'Architecture Overview' },
    { id: 'nlp-engine', title: 'Natural Language Processing' },
    { id: 'embeddings', title: 'Vector Embeddings & Semantic Search' },
    { id: 'context-ranking', title: 'Context-Aware AI Ranking' },
    { id: 'privacy', title: 'Privacy & Query Boundaries' },
    { id: 'faq', title: 'Frequently Asked Questions' },
  ]

  const relatedLinks = [
    {
      title: 'Categories Documentation',
      description: 'Explore how tourism categories are taxonomy-grouped by vector algorithms.',
      href: '/categories',
      iconName: 'grid' as const,
    },
    {
      title: 'Map Radar Guidance',
      description: 'Learn how spatial queries mesh with real-time GPS telemetry.',
      href: '/map-radar',
      iconName: 'map' as const,
    },
    {
      title: 'Developer API Specs',
      description: 'Integrate natural language travel search endpoints directly into your apps.',
      href: '/docs/api',
      iconName: 'settings' as const,
    },
  ]

  const faqItems = [
    {
      question: 'How does Nearby process complex travel queries like "quiet sunset spots under ₹2000"?',
      answer: 'Our engine parses intent into spatial constraints (near Panaji), budget constraints (<₹2000), atmospheric descriptors (quiet, sunset view), and category filters (scenic overlooks, quiet beaches) using multi-lingual Transformer models.',
    },
    {
      question: 'Are natural language search queries logged or sold to third parties?',
      answer: 'No. Queries are processed anonymously using zero-retention tokens strictly to compute real-time spatial recommendations. Personal identity data is never attached to query embeddings.',
    },
    {
      question: 'Can I search in languages other than English?',
      answer: 'Yes. Nearby supports multi-lingual NLP across 18 major international and regional languages including Hindi, Marathi, German, French, and Spanish.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'AI Natural Language Search Engine',
        description: 'Deep dive into Nearby\'s semantic discovery architecture, vector query embeddings, and real-time contextual recommendation pipelines.',
        category: 'Core AI Engine',
        iconName: 'sparkles',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Enterprise',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Architecture Overview */}
      <SectionCard id="overview" title="Architecture Overview" iconName="sparkles" badgeText="Vector Pipeline">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Traditional travel platforms rely on rigid dropdown filters (e.g. city, star rating, exact price range). Nearby replaces rigid filters with a high-dimensional vector search model that understands implicit context, mood, budget constraints, and temporal intent.
        </p>

        {/* SVG Architecture Flow Illustration */}
        <div className="my-6 rounded-sm border border-border/80 bg-zinc-950 p-6 shadow-inner">
          <svg className="w-full h-auto max-w-full" viewBox="0 0 700 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="180" height="70" rx="4" fill="#27272A" stroke="#10B981" strokeWidth="1.5" />
            <text x="110" y="60" fill="#FAFAFA" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">User Query</text>
            <text x="110" y="78" fill="#A1A1AA" fontSize="10" textAnchor="middle" fontFamily="sans-serif">"Romantic sunset dinner"</text>

            <path d="M 200 65 L 250 65" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />

            <rect x="250" y="30" width="200" height="70" rx="4" fill="#18181B" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="350" y="60" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Transformer Embedding</text>
            <text x="350" y="78" fill="#A1A1AA" fontSize="10" textAnchor="middle" fontFamily="sans-serif">768-D Vector Encoding</text>

            <path d="M 450 65 L 500 65" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />

            <rect x="500" y="30" width="180" height="70" rx="4" fill="#27272A" stroke="#10B981" strokeWidth="1.5" />
            <text x="590" y="60" fill="#FAFAFA" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Vector Index</text>
            <text x="590" y="78" fill="#A1A1AA" fontSize="10" textAnchor="middle" fontFamily="sans-serif">HNSW Cosine Match</text>

            {/* Bottom Flow */}
            <path d="M 590 100 L 590 150 L 350 150" stroke="#10B981" strokeWidth="2" fill="none" />
            <rect x="250" y="135" width="200" height="65" rx="4" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="1.5" />
            <text x="350" y="163" fill="#10B981" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Real-Time Tailored Places</text>
            <text x="350" y="180" fill="#FAFAFA" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Ranked by distance, rating & ETA</text>
          </svg>
        </div>

        <CalloutBox type="info" title="Zero Artificial Friction">
          Users can type natural sentences, voice transcripts, or fragments. The system parses multi-variable parameters in real-time without requiring dropdown adjustments.
        </CalloutBox>
      </SectionCard>

      {/* Section 2: Natural Language Processing */}
      <SectionCard id="nlp-engine" title="Natural Language Processing (NLP)" iconName="sparkles" badgeText="Model Specs">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Our specialized NLP fine-tunes Transformer models on millions of geographic telemetry logs, travel itineraries, restaurant menus, and architectural reviews.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="rounded-sm border border-border/60 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Icon name="search" size="xs" className="text-primary" />
              <span>Entity Extraction</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Extracts locations, price points, dietary restrictions, crowd preferences, and travel party composition.
            </p>
          </div>

          <div className="rounded-sm border border-border/60 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Icon name="clock" size="xs" className="text-amber-400" />
              <span>Temporal Resolution</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluates phrases like "late night snacks" or "early morning coffee" against live establishment opening hours.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Vector Embeddings & Semantic Search */}
      <SectionCard id="embeddings" title="Vector Embeddings & Semantic Search" iconName="grid" badgeText="HNSW Index">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Destinations, reviews, menus, and environmental attributes are mapped into a high-dimensional vector space. When a user submits a search query, Nearby calculates the cosine distance between the query vector and millions of candidate destinations.
        </p>

        <ul className="space-y-2 text-xs text-muted-foreground list-disc list-inside">
          <li><strong>Hierarchical Navigable Small World (HNSW):</strong> Sub-millisecond ANN vector indexing across millions of destination attributes.</li>
          <li><strong>Contextual Weighting:</strong> Incorporates current weather conditions, time of day, and live traffic telemetry into vector scoring.</li>
        </ul>
      </SectionCard>

      {/* Section 4: Context-Aware AI Ranking */}
      <SectionCard id="context-ranking" title="Context-Aware AI Ranking" iconName="star" badgeText="Re-Ranking">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Vector matching provides candidate places, which are then passed through a secondary context re-ranking model:
        </p>

        <div className="space-y-3 my-3">
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <span className="font-semibold text-foreground">Spatial Proximity Weight</span>
            <span className="font-mono text-xs font-bold text-teal-400">40% Factor</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <span className="font-semibold text-foreground">Semantic Query Relevance</span>
            <span className="font-mono text-xs font-bold text-amber-400">35% Factor</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <span className="font-semibold text-foreground">Live Telemetry & User Ratings</span>
            <span className="font-mono text-xs font-bold text-emerald-400">25% Factor</span>
          </div>
        </div>
      </SectionCard>

      {/* Section 5: Privacy & Query Boundaries */}
      <SectionCard id="privacy" title="Privacy & Query Boundaries" iconName="shield" badgeText="Data Ethics">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Queries are tokenized anonymously. We do not build behavioral advertising profiles or sell user query logs to third-party ad brokers.
        </p>
        <CalloutBox type="security" title="Zero Retention Guarantee">
          Query vector representations are discarded immediately after delivering search results, unless explicitly saved to your account favorites.
        </CalloutBox>
      </SectionCard>

      {/* Section 6: FAQ */}
      <SectionCard id="faq" title="Frequently Asked Questions" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default AISearchPage
