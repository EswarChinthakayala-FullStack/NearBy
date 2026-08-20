import React, { useState } from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { FAQAccordion } from '@/components/information/FAQAccordion'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import axiosClient from '@/services/api/axiosClient'

export const CookiePreferencesPage: React.FC = () => {
  const [analytics, setAnalytics] = useState(() => {
    try {
      const savedConsents = localStorage.getItem('nearby_cookie_consents')
      if (savedConsents) {
        const parsed = JSON.parse(savedConsents)
        if (typeof parsed.analytics === 'boolean') return parsed.analytics
      }
    } catch {
      // use default
    }
    return true
  })

  const [functional, setFunctional] = useState(() => {
    try {
      const savedConsents = localStorage.getItem('nearby_cookie_consents')
      if (savedConsents) {
        const parsed = JSON.parse(savedConsents)
        if (typeof parsed.functional === 'boolean') return parsed.functional
      }
    } catch {
      // use default
    }
    return true
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const consents = {
      essential: true, // Always required
      analytics,
      functional,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem('nearby_cookie_consents', JSON.stringify(consents))
    axiosClient.patch('/users/me', { cookie_consents: consents }).catch(() => {
      // Local preference saved cleanly
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const breadcrumbs = [
    { label: 'Legal & Privacy', href: '/privacy' },
    { label: 'Cookie Policy & Consent Manager' },
  ]

  const tocItems = [
    { id: 'manager', title: 'Cookie Consent Manager' },
    { id: 'essential', title: 'Essential Platform Cookies' },
    { id: 'analytics', title: 'Performance & Analytics Cookies' },
    { id: 'functional', title: 'Functional & Preference Cookies' },
    { id: 'faq', title: 'Cookie Policy FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'Privacy Policy',
      description: 'Review our master privacy and user rights documentation.',
      href: '/privacy',
      iconName: 'shield' as const,
    },
    {
      title: 'Terms of Service',
      description: 'Review legal terms and acceptable usage.',
      href: '/terms',
      iconName: 'settings' as const,
    },
  ]

  const faqItems = [
    {
      question: 'What happens if I disable analytics cookies?',
      answer: 'Disabling analytics cookies will not restrict your access to Nearby search features or maps. It simply prevents your anonymous usage patterns from being included in aggregate telemetry reports.',
    },
    {
      question: 'How long do cookie preferences remain saved?',
      answer: 'Your consent choices are stored in local storage for 12 months, after which you will be prompted to confirm your preferences again.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'Cookie Policy & Consent Manager',
        description: 'Manage your cookie consents, privacy preferences, and local storage data settings across Nearby web and progressive mobile applications.',
        category: 'Privacy Settings',
        iconName: 'settings',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Consent Manager',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Cookie Consent Manager */}
      <SectionCard id="manager" title="Interactive Cookie Consent Manager" iconName="settings" badgeText="Your Controls">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Customize your privacy options below. Essential security and authentication cookies are mandatory to run the Nearby application.
        </p>

        <div className="space-y-4 my-4">
          {/* Essential Toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-sm border border-border/80 bg-card/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">Essential Platform Cookies</span>
                <span className="font-mono text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-sm border border-teal-500/20 font-semibold">
                  Required
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Required for core security, session authentication, CSRF defense, and theme preferences. Cannot be disabled.
              </p>
            </div>
            <div className="h-6 w-11 shrink-0 rounded-sm bg-primary/40 opacity-70 cursor-not-allowed flex items-center px-1">
              <div className="h-4 w-4 rounded-sm bg-primary translate-x-5" />
            </div>
          </div>

          {/* Analytics Toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-sm border border-border/80 bg-card/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">Performance & Analytics Cookies</span>
                <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20 font-semibold">
                  Optional
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Helps us measure anonymous page load performance, search error rates, and feature usage to improve platform reliability.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAnalytics(!analytics)}
              className={`h-6 w-11 shrink-0 rounded-sm transition-colors flex items-center px-1 ${
                analytics ? 'bg-primary' : 'bg-muted border border-border'
              }`}
            >
              <div
                className={`h-4 w-4 rounded-sm bg-card shadow-xs transition-transform ${
                  analytics ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Functional Toggle */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-sm border border-border/80 bg-card/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">Functional & Preference Cookies</span>
                <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20 font-semibold">
                  Optional
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Stores your saved offline map tile regions, custom search radius preferences, and filter configurations locally.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFunctional(!functional)}
              className={`h-6 w-11 shrink-0 rounded-sm transition-colors flex items-center px-1 ${
                functional ? 'bg-primary' : 'bg-muted border border-border'
              }`}
            >
              <div
                className={`h-4 w-4 rounded-sm bg-card shadow-xs transition-transform ${
                  functional ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button onClick={handleSave} variant="default" size="default" className="h-9 px-5 text-xs font-semibold gap-2">
            <Icon name="check" size="xs" />
            <span>Save Preferences</span>
          </Button>
          {saved && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <Icon name="success" size="xs" /> Preferences saved successfully!
            </span>
          )}
        </div>
      </SectionCard>

      {/* Section 2: Essential */}
      <SectionCard id="essential" title="Essential Platform Cookies Details" iconName="shield" badgeText="Technical Specs">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Cookies like <code className="font-mono text-primary bg-muted px-1.5 py-0.5 rounded-sm">__nb_session</code> and <code className="font-mono text-primary bg-muted px-1.5 py-0.5 rounded-sm">theme_pref</code> store strictly necessary operational data. They carry HTTPOnly, Secure, and SameSite=Strict flags.
        </p>
      </SectionCard>

      {/* Section 3: Analytics */}
      <SectionCard id="analytics" title="Performance & Analytics Specifications" iconName="grid" badgeText="Telemetry Scope">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Analytics events are aggregated anonymously. We do not use third-party cross-site advertising cookies or sell browser fingerprint data.
        </p>
      </SectionCard>

      {/* Section 4: Functional */}
      <SectionCard id="functional" title="Functional Storage & Offline Caching" iconName="offline" badgeText="IndexedDB">
        <p className="text-xs text-muted-foreground leading-relaxed">
          In addition to standard cookies, Nearby utilizes IndexedDB and CacheStorage to store vector map tiles locally for offline navigation.
        </p>
      </SectionCard>

      {/* Section 5: FAQ */}
      <SectionCard id="faq" title="Cookie Policy FAQ" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default CookiePreferencesPage
