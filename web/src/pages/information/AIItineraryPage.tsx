import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'
import { Icon } from '@/components/common/Icon'

export const AIItineraryPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Features', href: '/#ai-companion' },
    { label: 'AI Itinerary Planner & Multi-Stop Optimizer' },
  ]

  const tocItems = [
    { id: 'itinerary-overview', title: 'Smart Scheduling Overview' },
    { id: 'constraint-solver', title: 'Multi-Constraint Solver' },
    { id: 'sample-timeline', title: 'Sample Generated Itinerary Timeline' },
    { id: 'route-optimization', title: 'Route Transit Optimization' },
    { id: 'faq', title: 'Itinerary Planner FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'AI Search Engine',
      description: 'Learn how custom search prompts feed into itinerary plans.',
      href: '/features/ai-search',
      iconName: 'sparkles' as const,
    },
    {
      title: 'Map Radar Guidance',
      description: 'See live transit calculations along multi-stop routes.',
      href: '/map-radar',
      iconName: 'map' as const,
    },
  ]

  const faqItems = [
    {
      question: 'Can I edit individual stops in an AI-generated itinerary?',
      answer: 'Yes. You can swap venues, adjust stop durations, lock preferred times, or add custom notes. The AI engine dynamically re-optimizes remaining stops in real time.',
    },
    {
      question: 'Does the planner account for meal times and travel fatigue?',
      answer: 'Yes. The algorithm embeds mandatory rest buffers, recommends dining stops near active time windows, and avoids scheduling intense walking tours during mid-day heat.',
    },
  ]

  const timelineSteps = [
    { time: '09:00 AM', title: 'Historic Heritage Walk', location: 'Fontainhas Latin Quarter', note: 'Morning shade & architectural photography' },
    { time: '11:30 AM', title: 'UNESCO Monument Tour', location: 'Basilica of Bom Jesus', note: 'Guided sanctuary walkthrough (1.5 hrs)' },
    { time: '01:30 PM', title: 'Traditional Goan Lunch', location: 'Mum\'s Kitchen Panaji', note: 'Authentic fish thali & local beverage' },
    { time: '04:30 PM', title: 'Sunset Fort Viewpoint', location: 'Aguada Fort & Lighthouse', note: 'Coastal sunset view & breeze' },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'AI Itinerary Planner & Multi-Stop Optimizer',
        description: 'Learn how Nearby solves multi-variable travel itineraries, balancing budget constraints, transit times, weather forecasts, and opening hours.',
        category: 'Travel Intelligence',
        iconName: 'route',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Enterprise',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Overview */}
      <SectionCard id="itinerary-overview" title="Smart Scheduling Overview" iconName="route" badgeText="Planning Engine">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Planning a multi-day trip involves solving complex Traveling Salesperson Problems (TSP) while balancing opening hours, dining windows, physical fatigue, and real-time weather forecasts. Nearby automates itinerary creation in under 3 seconds.
        </p>

        <CalloutBox type="tip" title="Adaptive Itinerary Solver">
          If rain is forecasted at 3:00 PM, Nearby automatically moves outdoor beach stops to the morning and schedules indoor museum visits during afternoon showers.
        </CalloutBox>
      </SectionCard>

      {/* Section 2: Multi-Constraint Solver */}
      <SectionCard id="constraint-solver" title="Multi-Constraint Solver Architecture" iconName="settings" badgeText="Optimization Vector">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          <div className="rounded-sm border border-border/60 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Icon name="clock" size="xs" className="text-teal-400" />
              <span>Opening Hours Alignment</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Guarantees stops are scheduled strictly when destinations are open to visitors, avoiding closed-gate disappointments.
            </p>
          </div>

          <div className="rounded-sm border border-border/60 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Icon name="location" size="xs" className="text-amber-400" />
              <span>Transit Time Reduction</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Orders stops geographical clusters to reduce daily driving time by up to 45%.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Sample Generated Itinerary Timeline */}
      <SectionCard id="sample-timeline" title="Sample Generated Itinerary Timeline" iconName="clock" badgeText="1-Day Goa Express">
        <div className="space-y-4 my-2 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {timelineSteps.map((step, idx) => (
            <div key={step.time} className="relative flex items-start gap-4 pl-10">
              <div className="absolute left-2.5 top-1.5 h-3.5 w-3.5 -translate-x-1/2 rounded-sm border-2 border-primary bg-card" />
              <div className="flex-1 rounded-sm border border-border/80 bg-card/60 p-4 backdrop-blur-md space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">{step.time}</span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">Stop #{idx + 1}</span>
                </div>
                <h4 className="text-sm font-bold font-heading text-foreground">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.location}</p>
                <p className="text-[11px] text-amber-400 font-medium pt-1">💡 {step.note}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 4: Route Transit Optimization */}
      <SectionCard id="route-optimization" title="Route Transit Optimization" iconName="navigation" badgeText="Live ETA">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Transit matrices evaluate driving, walking, and public transit schedules in real time, alerting travelers to sudden traffic jams or road closures along planned routes.
        </p>
      </SectionCard>

      {/* Section 5: FAQ */}
      <SectionCard id="faq" title="Itinerary Planner FAQ" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default AIItineraryPage
