import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'

export const CommunityPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Community', href: '/community' },
    { label: 'Platform Guidelines & Moderation' },
  ]

  const tocItems = [
    { id: 'guidelines', title: 'Community Guidelines' },
    { id: 'review-standards', title: 'Review Integrity & Verification' },
    { id: 'abuse-reporting', title: 'Reporting & Spam Prevention' },
    { id: 'reputation-tiers', title: 'Contributor Reputation Tiers' },
    { id: 'faq', title: 'Community FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'Popular Places Index',
      description: 'Explore community-reviewed destination ratings.',
      href: '/places',
      iconName: 'places' as const,
    },
    {
      title: 'Terms of Service',
      description: 'Review legal acceptable use policies.',
      href: '/terms',
      iconName: 'settings' as const,
    },
  ]

  const faqItems = [
    {
      question: 'How do I report an inaccurate review or offensive image?',
      answer: 'Click the action menu (...) on any review card and select "Report Content". Reports are reviewed by our moderation algorithms and human safety team within 4 hours.',
    },
    {
      question: 'How can I become a Verified Local Explorer?',
      answer: 'Users who submit at least 25 geographically verified place contributions with high helpfulness ratings are awarded the Verified Local badge.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'Platform Community & Moderation Standards',
        description: 'Discover how Nearby fosters a trustworthy, respectful, and helpful community of global travelers and local experts.',
        category: 'Trust & Safety',
        iconName: 'user',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Community Standards',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Community Guidelines */}
      <SectionCard id="guidelines" title="Core Community Guidelines" iconName="user" badgeText="Ethical Conduct">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Nearby is built on mutual trust, authenticity, and respect. All community reviews, photo contributions, and forum posts must adhere to our zero-tolerance policies against hate speech, harassment, fake reviews, or commercial spam.
        </p>

        <CalloutBox type="security" title="Zero Tolerance Policy">
          Any account engaged in automated review manipulation, fake rating rings, or targeted harassment will be permanently suspended immediately.
        </CalloutBox>
      </SectionCard>

      {/* Section 2: Review Integrity */}
      <SectionCard id="review-standards" title="Review Integrity & Quality Standards" iconName="star" badgeText="Quality Control">
        <p className="text-xs text-muted-foreground leading-relaxed">
          High quality reviews provide detailed context, authentic photos, and objective pros/cons. Reviews containing profanity, pure promotional links, or off-topic rants are filtered automatically.
        </p>
      </SectionCard>

      {/* Section 3: Reporting & Spam Prevention */}
      <SectionCard id="abuse-reporting" title="Abuse Reporting & Automated Moderation" iconName="shield" badgeText="Automated Filters">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Our dual-layer moderation pipeline combines automated NLP classification with dedicated human safety reviewers to investigate flagged content 24/7.
        </p>
      </SectionCard>

      {/* Section 4: Contributor Reputation Tiers */}
      <SectionCard id="reputation-tiers" title="Contributor Reputation Tiers" iconName="sparkles" badgeText="Explorer Badges">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          <div className="rounded-sm border border-border/60 bg-card/60 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">Tier 1</span>
            <p className="text-sm font-bold text-foreground">Explorer</p>
            <p className="text-xs text-muted-foreground">1 to 10 verified contributions</p>
          </div>

          <div className="rounded-sm border border-border/60 bg-card/60 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-teal-400 font-semibold">Tier 2</span>
            <p className="text-sm font-bold text-teal-400">Local Guide</p>
            <p className="text-xs text-muted-foreground">10 to 50 verified contributions</p>
          </div>

          <div className="rounded-sm border border-border/60 bg-card/60 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">Tier 3</span>
            <p className="text-sm font-bold text-amber-400">Master Explorer</p>
            <p className="text-xs text-muted-foreground">50+ top-rated contributions</p>
          </div>
        </div>
      </SectionCard>

      {/* Section 5: FAQ */}
      <SectionCard id="faq" title="Community FAQ" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default CommunityPage
