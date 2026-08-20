import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion-variants'

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: 'Step 1',
      title: 'Enter Your Travel Query',
      desc: 'Type what you feel like experiencing in plain language — no rigid filter dropdowns required.',
      icon: 'search' as const,
    },
    {
      step: 'Step 2',
      title: 'AI Coder & Radar Engine',
      desc: 'Nearby scans open locations, transit times, weather conditions, and verified traveler scores.',
      icon: 'sparkles' as const,
    },
    {
      step: 'Step 3',
      title: 'Instant Route & Exploration',
      desc: 'Receive a personalized, navigable itinerary ready to launch on your device.',
      icon: 'navigation' as const,
    },
  ]

  return (
    <section id="how-it-works" className="py-24 border-t border-border bg-card/30 relative">
      <div className="mx-auto max-w-7xl px-6 space-y-16">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="accent" className="gap-1 px-3 py-1">
            <Icon name="sparkles" size="xs" /> 3-Step Simplicity
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
            How Nearby Works
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Planning your dream travel route takes less than 5 seconds.
          </p>
        </div>

        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {steps.map((item) => (
            <motion.div
              key={item.step}
              variants={staggerItemVariants}
              className="flex flex-col items-center text-center rounded-sm border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 p-6 sm:p-8 shadow-sm space-y-4 hover:border-primary/50 transition-all backdrop-blur-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-secondary text-primary border border-primary/20 shadow-xs">
                <Icon name={item.icon} size="lg" />
              </div>
              <span className="text-xs font-bold text-primary font-mono">{item.step}</span>
              <h3 className="text-xl font-bold font-heading text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
