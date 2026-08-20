import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'

export const LocationSecurityPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Security & Trust', href: '/location-security' },
    { label: 'Location Security & Geolocation Privacy' },
  ]

  const tocItems = [
    { id: 'zero-trace', title: 'Zero-Trace Location Architecture' },
    { id: 'geohashing', title: 'Geohash Cloaking & Differentials' },
    { id: 'permission-controls', title: 'User Permission Management' },
    { id: 'encryption-transit', title: 'TLS 1.3 Encryption Specs' },
    { id: 'faq', title: 'Location Security FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'Privacy Policy',
      description: 'Review overall user data policies and GDPR compliance.',
      href: '/privacy',
      iconName: 'shield' as const,
    },
    {
      title: 'Map Radar Guidance',
      description: 'See live spatial queries in action.',
      href: '/map-radar',
      iconName: 'map' as const,
    },
  ]

  const faqItems = [
    {
      question: 'How does geohash cloaking protect my exact home address?',
      answer: 'Instead of transmitting exact lat/lng coordinates (e.g. 15.498123, 73.834192), Nearby truncates precision to a 5-character geohash (~4.9km² grid), preventing server identification of specific residences.',
    },
    {
      question: 'Can third-party SDKs read my location through Nearby?',
      answer: 'No. Nearby uses zero third-party location SDKs or ad trackers. Geolocation APIs are accessed strictly through native browser permissions.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'Location Security & Geolocation Privacy',
        description: 'Deep dive into Nearby\'s zero-trace spatial architecture, on-device geohash cloaking, and end-to-end GPS telemetry encryption.',
        category: 'Security Architecture',
        iconName: 'shield',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Security Whitepaper',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Zero-Trace Location Architecture */}
      <SectionCard id="zero-trace" title="Zero-Trace Location Architecture" iconName="shield" badgeText="Privacy First">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Traditional map applications maintain persistent logs of user movements, creating vulnerability vectors. Nearby introduces a stateless, zero-trace spatial lookup model.
        </p>

        {/* SVG Diagram: Zero-Trace Cloaking Pipeline */}
        <div className="my-6 rounded-sm border border-border/80 bg-zinc-950 p-6 shadow-inner">
          <svg className="w-full h-auto max-w-full" viewBox="0 0 700 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="40" width="160" height="60" rx="4" fill="#27272A" stroke="#10B981" strokeWidth="1.5" />
            <text x="110" y="68" fill="#FAFAFA" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Device GPS Signal</text>
            <text x="110" y="85" fill="#A1A1AA" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Exact Lat / Long</text>

            <path d="M 190 70 L 240 70" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />

            <rect x="240" y="40" width="220" height="60" rx="4" fill="#18181B" stroke="#F59E0B" strokeWidth="1.5" />
            <text x="350" y="68" fill="#F59E0B" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">On-Device Geohash Cloak</text>
            <text x="350" y="85" fill="#A1A1AA" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Truncated Spatial Grid (5-char)</text>

            <path d="M 460 70 L 510 70" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />

            <rect x="510" y="40" width="160" height="60" rx="4" fill="#27272A" stroke="#10B981" strokeWidth="1.5" />
            <text x="590" y="68" fill="#FAFAFA" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Ephemeral Query</text>
            <text x="590" y="85" fill="#10B981" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Zero Logs Discard</text>
          </svg>
        </div>

        <CalloutBox type="security" title="Zero Movement History Storage">
          Nearby servers store no persistent database records of where your device has traveled.
        </CalloutBox>
      </SectionCard>

      {/* Section 2: Geohashing */}
      <SectionCard id="geohashing" title="Geohash Cloaking & Differential Privacy" iconName="location" badgeText="Spatial Grid">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Geohashing converts continuous 2D latitude/longitude points into hierarchical string identifiers. By limiting geohash resolution during public vector queries, your exact position is shielded while still fetching highly relevant nearby places.
        </p>
      </SectionCard>

      {/* Section 3: User Permission Management */}
      <SectionCard id="permission-controls" title="User Permission Management" iconName="settings" badgeText="Controls">
        <div className="space-y-3 my-2">
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <div>
              <p className="font-bold text-foreground">Precise Geolocation Access</p>
              <p className="text-[11px] text-muted-foreground">Requests browser high-accuracy GPS for live map sweeps</p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-400">User Controlled</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-sm border border-border/60 bg-card/60">
            <div>
              <p className="font-bold text-foreground">Background Location Sync</p>
              <p className="text-[11px] text-muted-foreground">Updates destination alerts when app is minimized</p>
            </div>
            <span className="font-mono text-xs font-bold text-amber-400">Default Off</span>
          </div>
        </div>
      </SectionCard>

      {/* Section 4: TLS 1.3 Encryption Specs */}
      <SectionCard id="encryption-transit" title="TLS 1.3 & Encrypted Telemetry" iconName="shield" badgeText="AES-256 GCM">
        <p className="text-xs text-muted-foreground leading-relaxed">
          All spatial telemetry payloads are encrypted in transit using TLS 1.3 with Perfect Forward Secrecy (PFS), protecting queries from packet sniffing on public Wi-Fi networks.
        </p>
      </SectionCard>

      {/* Section 5: FAQ */}
      <SectionCard id="faq" title="Location Security FAQ" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default LocationSecurityPage
