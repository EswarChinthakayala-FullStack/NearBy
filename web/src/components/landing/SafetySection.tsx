import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { fadeInUp, staggerContainer } from '@/lib/motion-variants'

export const SafetySection: React.FC = () => {
  const safetyFeatures = [
    { title: 'Verified Destination Spot Data', desc: 'All spatial markers are cross-verified via OpenStreetMap spatial data.', icon: 'shield' as const },
    { title: 'Privacy-First Location Radar', desc: 'Your GPS coordinates remain local to your browser session and are never logged.', icon: 'lock' as const },
    { title: 'Community Review Integrity', desc: 'User ratings and comments undergo automated spam & abuse filtering.', icon: 'star' as const },
  ]

  return (
    <section className="py-20 bg-background text-foreground relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
            <Icon name="shield" size="xs" />
            <span>Trust & Location Privacy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
            Travel security & data protection.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We prioritize traveler safety, spatial accuracy, and transparent data privacy practices.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {safetyFeatures.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              className="p-6 rounded-sm border border-border/70 bg-card/50 backdrop-blur-md space-y-3 shadow-sm hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 font-bold">
                <Icon name={item.icon} size="sm" />
              </div>
              <h3 className="text-sm font-bold text-foreground font-heading">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default SafetySection
