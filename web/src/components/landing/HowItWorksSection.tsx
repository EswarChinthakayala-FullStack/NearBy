import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { fadeInUp, staggerContainer } from '@/lib/motion-variants'

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Discover Destinations',
      description: 'Filter top-rated attraction spots or ask our AI vector engine using natural language.',
      icon: 'search' as const,
    },
    {
      number: '02',
      title: 'Explore Spatial Radar',
      description: 'Activate real-time location radar to view nearby spots, opening timings, and verified reviews.',
      icon: 'map' as const,
    },
    {
      number: '03',
      title: 'Navigate & Visit',
      description: 'Follow optimal multi-stop TSP routes with offline vector map tile support.',
      icon: 'navigation' as const,
    },
  ]

  return (
    <section className="py-20 bg-background text-foreground relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
            <Icon name="route" size="xs" />
            <span>Workflow & Exploration</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
            How Nearby works.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Three simple steps to plan your itinerary, explore regional spots, and travel with confidence.
          </p>
        </div>

        {/* 3 Step Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              className="relative p-8 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md space-y-4 shadow-sm hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 font-bold">
                  <Icon name={step.icon} size="md" />
                </div>
                <span className="text-2xl font-black font-mono text-muted-foreground/30">{step.number}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorksSection
