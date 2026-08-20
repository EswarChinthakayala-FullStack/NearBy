import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { fadeInUp } from '@/lib/motion-variants'

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-background text-foreground relative border-t border-border/50 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-amber-500/10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="rounded-sm border border-border/80 bg-card/80 backdrop-blur-2xl p-8 sm:p-14 shadow-2xl text-center space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
            <Icon name="sparkles" size="xs" />
            <span>Start Exploring Nearby</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-foreground leading-tight">
            Ready to discover regional destination spots?
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Join thousands of travelers using Nearby to save regional guides, unlock location radar, and generate neural AI itineraries.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2 shadow-lg">
                <Icon name="profile" size="xs" />
                <span>Create Free Account</span>
              </Button>
            </Link>

            <Link to="/places">
              <Button variant="outline" size="lg" className="rounded-sm font-semibold border-border/80 gap-2">
                <span>Explore Destination Index</span>
                <Icon name="arrow-right" size="xs" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection
