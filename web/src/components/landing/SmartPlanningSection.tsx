import React from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion-variants'

export interface TimelineStep {
  step: string
  title: string
  desc: string
  icon: IconName
}

export const SmartPlanningSection: React.FC = () => {
  const steps: TimelineStep[] = [
    { step: '01', title: 'Search Naturally', desc: 'Type or speak your travel desires in plain language.', icon: 'search' },
    { step: '02', title: 'Discover Recommendations', desc: 'AI scans regional places, ratings, and open hours.', icon: 'sparkles' },
    { step: '03', title: 'Generate Custom Plan', desc: 'Receive a personalized time-aware itinerary.', icon: 'bookmark' },
    { step: '04', title: 'Navigate In Real-Time', desc: 'Turn-by-turn routing with live distance radar.', icon: 'navigation' },
    { step: '05', title: 'Explore & Review', desc: 'Save favorites, leave ratings, and log memories.', icon: 'ratings' },
    { step: '06', title: 'Share Travel Guides', desc: 'Export your travel itinerary with friends and family.', icon: 'share' },
  ]

  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-7xl px-6 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="accent" className="gap-1 px-3 py-1">
            <Icon name="navigation" size="xs" /> End-To-End Journey Flow
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
            How Nearby Powers Your Complete Travel Experience
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From initial destination curiosity to seamless turn-by-turn exploration.
          </p>
        </div>

        {/* Timeline Grid */}
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative"
        >
          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={staggerItemVariants}
              className="relative flex flex-col justify-between rounded-sm border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 p-5 sm:p-6 shadow-sm hover:border-primary/50 transition-all space-y-4 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-primary/40">{step.step}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-secondary text-primary border border-primary/20">
                  <Icon name={step.icon} size="md" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold font-heading text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
