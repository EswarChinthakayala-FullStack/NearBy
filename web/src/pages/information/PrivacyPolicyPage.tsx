import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { PolicyCard } from '@/components/information/PolicyCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'

export const PrivacyPolicyPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Legal & Privacy', href: '/privacy' },
    { label: 'Master Privacy Policy' },
  ]

  const tocItems = [
    { id: 'sec-1', title: '1. Data Collection Scope' },
    { id: 'sec-2', title: '2. GPS & Location Telemetry' },
    { id: 'sec-3', title: '3. Cookies & Local Storage' },
    { id: 'sec-4', title: '4. Data Storage & Encryption' },
    { id: 'sec-5', title: '5. User Rights & Data Requests' },
    { id: 'sec-6', title: '6. Privacy Contact' },
    { id: 'faq', title: 'Privacy FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'Location Security',
      description: 'Review technical GPS encryption & zero-trace protocols.',
      href: '/location-security',
      iconName: 'shield' as const,
    },
    {
      title: 'Cookie Preferences',
      description: 'Manage essential, functional, and analytics cookie consents.',
      href: '/cookies',
      iconName: 'settings' as const,
    },
    {
      title: 'Terms of Service',
      description: 'Read master platform terms and acceptable use rules.',
      href: '/terms',
      iconName: 'shield' as const,
    },
  ]

  const faqItems = [
    {
      question: 'Can I request full deletion of my personal data under GDPR/CCPA?',
      answer: 'Yes. You can submit a Data Deletion Request through your Account Settings or by emailing privacy@nearby.ai. All user data, itineraries, and saved favorites will be purged within 30 days.',
    },
    {
      question: 'Is my precise GPS location ever sold to advertisers?',
      answer: 'Never. Nearby has a strict zero-ad-broker policy. Location data is used solely on-device or via ephemeral encrypted requests to compute nearby recommendations.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'Master Privacy Policy',
        description: 'Comprehensive disclosure of Nearby\'s data collection practices, location telemetry handling, user privacy rights, and regulatory compliance standards.',
        category: 'Legal Compliance',
        iconName: 'shield',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Legal Notice',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      <CalloutBox type="security" title="Privacy Commitment">
        Nearby is designed around privacy-first principles. We do not sell your personal information, monetize location tracks, or track you across third-party websites.
      </CalloutBox>

      {/* Clause 1 */}
      <PolicyCard
        id="sec-1"
        sectionNumber="1.0"
        title="Data Collection Scope"
        description="We collect only the minimum necessary data to deliver AI search recommendations and itinerary generation."
        iconName="shield"
      >
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li><strong>Account Registration:</strong> Name, verified email address, and authentication credentials.</li>
          <li><strong>Usage Telemetry:</strong> Anonymized natural language search queries, saved places, and custom itinerary parameters.</li>
          <li><strong>Technical Metadata:</strong> Browser type, operating system, IP address (truncated), and language preference.</li>
        </ul>
      </PolicyCard>

      {/* Clause 2 */}
      <PolicyCard
        id="sec-2"
        sectionNumber="2.0"
        title="GPS & Location Telemetry"
        description="Detailed rules governing how high-precision geolocation signals are processed."
        iconName="location"
      >
        <p className="text-muted-foreground">
          Location data is accessed only when you explicitly enable spatial search or interactive map features. Precise coordinates are converted on-device into geohashes before querying recommendations, ensuring server logs contain no identifiable movement trajectories.
        </p>
      </PolicyCard>

      {/* Clause 3 */}
      <PolicyCard
        id="sec-3"
        sectionNumber="3.0"
        title="Cookies & Local Storage"
        description="How session identifiers, theme preferences, and offline map tiles are cached."
        iconName="settings"
      >
        <p className="text-muted-foreground">
          We use essential cookies for user authentication, CSRF security tokens, and theme preferences (Light/Dark/System). For detailed cookie management options, please visit our <a href="/cookies" className="text-primary underline">Cookie Preferences</a> page.
        </p>
      </PolicyCard>

      {/* Clause 4 */}
      <PolicyCard
        id="sec-4"
        sectionNumber="4.0"
        title="Data Storage & Encryption Standards"
        description="Security infrastructure protecting user data at rest and in transit."
        iconName="shield"
      >
        <p className="text-muted-foreground">
          All data transmitted between your device and Nearby servers is encrypted using TLS 1.3 with AES-256 GCM encryption at rest. Databases undergo continuous vulnerability scanning and strict role-based access control (RBAC).
        </p>
      </PolicyCard>

      {/* Clause 5 */}
      <PolicyCard
        id="sec-5"
        sectionNumber="5.0"
        title="User Rights (GDPR & CCPA)"
        description="Your statutory rights regarding data access, rectification, portability, and erasure."
        iconName="user"
      >
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li><strong>Right to Access:</strong> Export a full JSON archive of all personal data held by Nearby.</li>
          <li><strong>Right to Erasure:</strong> Request permanent account deletion and data scrubbing.</li>
          <li><strong>Right to Object:</strong> Opt out of optional performance analytics at any time.</li>
        </ul>
      </PolicyCard>

      {/* Clause 6 */}
      <PolicyCard
        id="sec-6"
        sectionNumber="6.0"
        title="Privacy Contact & Data Officer"
        description="Official communication channels for privacy inquiries."
        iconName="notifications"
      >
        <p className="text-muted-foreground">
          If you have questions regarding this Privacy Policy or wish to exercise your legal data rights, contact our Data Protection Officer at <code className="font-mono text-primary">privacy@nearby.ai</code>.
        </p>
      </PolicyCard>

      {/* FAQ */}
      <div id="faq" className="space-y-4 pt-4">
        <h3 className="text-lg font-bold font-heading text-foreground">Privacy Policy FAQ</h3>
        <FAQAccordion items={faqItems} />
      </div>
    </InformationLayout>
  )
}

export default PrivacyPolicyPage
