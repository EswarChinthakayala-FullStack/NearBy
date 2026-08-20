import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { PolicyCard } from '@/components/information/PolicyCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'

export const TermsOfServicePage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Legal & Privacy', href: '/terms' },
    { label: 'Master Terms of Service' },
  ]

  const tocItems = [
    { id: 'sec-1', title: '1. Acceptance & Eligibility' },
    { id: 'sec-2', title: '2. User Accounts & Responsibilities' },
    { id: 'sec-3', title: '3. Prohibited Platform Activities' },
    { id: 'sec-4', title: '4. Intellectual Property Rights' },
    { id: 'sec-5', title: '5. Limitation of Liability' },
    { id: 'sec-6', title: '6. Governing Law & Contact' },
    { id: 'faq', title: 'Terms FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'Privacy Policy',
      description: 'Review data collection and privacy protections.',
      href: '/privacy',
      iconName: 'shield' as const,
    },
    {
      title: 'Community Guidelines',
      description: 'Explore rules for place reviews and contributor standards.',
      href: '/community',
      iconName: 'user' as const,
    },
  ]

  const faqItems = [
    {
      question: 'May I use Nearby API for commercial applications?',
      answer: 'Commercial usage of Nearby API requires an active Enterprise API license agreement. Free developer tier usage is strictly limited to non-commercial evaluation.',
    },
    {
      question: 'How are disputes resolved under these Terms?',
      answer: 'Disputes are resolved via binding individual arbitration under rules of the International Chamber of Commerce (ICC), avoiding class-action litigation.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'Master Terms of Service',
        description: 'Legal terms, user agreements, acceptable use policies, and liability limitations governing access to Nearby software and services.',
        category: 'Legal Notice',
        iconName: 'shield',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Terms',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      <CalloutBox type="warning" title="Binding Legal Agreement">
        By accessing or using the Nearby platform, website, mobile progressive web applications, or API services, you agree to be bound by these Master Terms of Service.
      </CalloutBox>

      {/* Clause 1 */}
      <PolicyCard
        id="sec-1"
        sectionNumber="1.0"
        title="Acceptance of Terms & Eligibility"
        description="Conditions for accessing Nearby web and mobile services."
        iconName="check"
      >
        <p className="text-muted-foreground">
          You must be at least 18 years of age or possess legal parental consent to create an account. Usage of Nearby services in jurisdictions where prohibited by law is strictly void.
        </p>
      </PolicyCard>

      {/* Clause 2 */}
      <PolicyCard
        id="sec-2"
        sectionNumber="2.0"
        title="User Accounts & Security Responsibilities"
        description="Maintaining account credential confidentiality and acceptable use."
        iconName="user"
      >
        <p className="text-muted-foreground">
          You are responsible for maintaining the confidentiality of your login credentials and API keys. Nearby is not liable for unauthorized access resulting from compromised user credentials.
        </p>
      </PolicyCard>

      {/* Clause 3 */}
      <PolicyCard
        id="sec-3"
        sectionNumber="3.0"
        title="Prohibited Platform Activities"
        description="Strictly forbidden actions across all platform interfaces."
        iconName="warning"
      >
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Scraping destination content or vector indexes without written authorization.</li>
          <li>Submitting fake, automated, or commercially incentivized reviews.</li>
          <li>Reverse engineering Nearby AI embedding models or API algorithms.</li>
          <li>Attempting denial-of-service (DoS) attacks or bypassing rate limits.</li>
        </ul>
      </PolicyCard>

      {/* Clause 4 */}
      <PolicyCard
        id="sec-4"
        sectionNumber="4.0"
        title="Intellectual Property Rights"
        description="Ownership of algorithms, branding, and user-generated content."
        iconName="shield"
      >
        <p className="text-muted-foreground">
          All proprietary algorithms, vector indexes, UI components, trademarks, and code bases remain exclusive intellectual property of Nearby.ai Inc. User review contributions remain owned by submitters, subject to a worldwide royalty-free license granted to Nearby for platform display.
        </p>
      </PolicyCard>

      {/* Clause 5 */}
      <PolicyCard
        id="sec-5"
        sectionNumber="5.0"
        title="Limitation of Liability & Warranty Disclaimer"
        description="Legal disclaimers regarding real-time travel recommendations."
        iconName="shield"
      >
        <p className="text-muted-foreground">
          Nearby services are provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for 100% accuracy, Nearby disclaims liability for unexpected destination closures, weather disruptions, transit delays, or third-party venue inaccuracies.
        </p>
      </PolicyCard>

      {/* Clause 6 */}
      <PolicyCard
        id="sec-6"
        sectionNumber="6.0"
        title="Governing Law & Legal Contact"
        description="Legal jurisdiction and official support channels."
        iconName="notifications"
      >
        <p className="text-muted-foreground">
          These Terms are governed by state and federal laws without regard to conflict of law principles. Legal notices may be served to <code className="font-mono text-primary">legal@nearby.ai</code>.
        </p>
      </PolicyCard>

      {/* FAQ */}
      <div id="faq" className="space-y-4 pt-4">
        <h3 className="text-lg font-bold font-heading text-foreground">Terms of Service FAQ</h3>
        <FAQAccordion items={faqItems} />
      </div>
    </InformationLayout>
  )
}

export default TermsOfServicePage
