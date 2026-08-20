import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InformationCircleIcon,
  Search01Icon,
  UserIcon,
  Compass01Icon,
  FavouriteIcon,
  StarIcon,
  Shield01Icon,
  Mail01Icon,
} from '@hugeicons/core-free-icons'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const FAQ_SECTIONS = [
  {
    category: 'Account & Security',
    icon: UserIcon,
    items: [
      {
        q: 'How do I update my profile details or avatar image?',
        a: 'Navigate to "My Profile" in the portal sidebar. From there, you can upload a new avatar image, update your full name or phone number, and change your account password.',
      },
      {
        q: 'How does authentication work on Nearby?',
        a: 'Nearby uses secure JWT (JSON Web Token) authentication stored in memory/cookies with strict scope verification between user and administrator endpoints.',
      },
    ],
  },
  {
    category: 'Travel & Exploration',
    icon: Compass01Icon,
    items: [
      {
        q: 'How does the Spatial Radar search engine work?',
        a: 'The spatial engine utilizes PostGIS spatial indexing with OpenStreetMap Overpass telemetry to query nearby tourist spots within custom distance thresholds.',
      },
      {
        q: 'Can I generate multi-stop travel itineraries?',
        a: 'Yes, visit the AI Itinerary Planner to select your target region, travel style, and duration to generate an optimized route.',
      },
    ],
  },
  {
    category: 'Bookmarks & Favorites',
    icon: FavouriteIcon,
    items: [
      {
        q: 'Where are my bookmarked places saved?',
        a: 'When logged in, your bookmarked spots are saved directly to your account database via the backend API endpoints and accessible under "Favorites".',
      },
    ],
  },
  {
    category: 'Reviews & Moderation',
    icon: StarIcon,
    items: [
      {
        q: 'Are submitted reviews published immediately?',
        a: 'Review submissions are processed through administrative moderation to ensure content quality and anti-spam integrity.',
      },
    ],
  },
  {
    category: 'Privacy & Telemetry',
    icon: Shield01Icon,
    items: [
      {
        q: 'How is location data handled?',
        a: 'Your location coordinates are processed strictly in real-time for distance calculations and are never sold or shared with third parties.',
      },
    ],
  },
]

export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Standardized Page Header */}
      <PageHeader
        title="Help Center & Knowledge Base"
        description="Search FAQs, platform guides, security protocols, and contact customer support."
        breadcrumbs={[{ label: 'Support' }, { label: 'Help Center' }]}
      />
      {/* Header Banner */}
      <div className="p-6 rounded-sm border border-emerald-500/20 bg-card space-y-4 text-center sm:text-left shadow-xs">
        <h2 className="text-xl font-bold font-heading text-foreground flex items-center justify-center sm:justify-start gap-2">
          <HugeiconsIcon icon={InformationCircleIcon} className="size-5 text-cyan-400" />
          <span>Help Center & Knowledge Base</span>
        </h2>
        <p className="text-xs text-muted-foreground max-w-xl">
          Frequently asked questions about account settings, spatial exploration, review moderation, and data privacy
        </p>

        <div className="relative max-w-md">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics..."
            className="pl-9 text-xs rounded-sm bg-muted/40 border-border"
          />
        </div>
      </div>

      {/* Categorized FAQ Accordions */}
      <div className="space-y-6">
        {FAQ_SECTIONS.map((section) => {
          const filteredItems = section.items.filter(
            (item) =>
              item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.a.toLowerCase().includes(searchQuery.toLowerCase())
          )

          if (searchQuery && filteredItems.length === 0) return null

          return (
            <Card key={section.category} className="border-border bg-card shadow-xs">
              <div className="p-4 border-b border-border/40 flex items-center gap-2">
                <HugeiconsIcon icon={section.icon} className="size-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
                  {section.category}
                </h3>
              </div>

              <CardContent className="p-4">
                <Accordion className="w-full">
                  {filteredItems.map((item, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border-border/40">
                      <AccordionTrigger className="text-xs font-bold text-foreground hover:text-emerald-400 text-left py-3">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-3">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Support Contact Footer */}
      <Card className="border-border bg-card p-6 text-center space-y-3 shadow-xs">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 mx-auto">
          <HugeiconsIcon icon={Mail01Icon} className="size-5" />
        </div>
        <h4 className="text-sm font-bold text-foreground font-heading">Still Have Questions?</h4>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Our administrative support team is available for platform inquiries, API access requests, and account assistance.
        </p>
        <Button
          onClick={() => (window.location.href = 'mailto:support@nearby.ai')}
          className="h-9 px-5 mx-auto inline-flex items-center justify-center rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-2 shadow-xs transition-all"
        >
          <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
          <span>Contact Support Team</span>
        </Button>
      </Card>
    </div>
  )
}

export default HelpCenterPage
