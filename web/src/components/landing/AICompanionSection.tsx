import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { AISearchIllustration } from '@/components/illustrations/AISearchIllustration'
import { fadeInUp, staggerContainer } from '@/lib/motion-variants'

export const AICompanionSection: React.FC = () => {
  return (
    <section className="py-20 bg-background text-foreground relative border-t border-border/50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Left Illustration */}
          <motion.div variants={fadeInUp} className="lg:col-span-6">
            <AISearchIllustration />
          </motion.div>

          {/* Right Feature Info */}
          <motion.div variants={fadeInUp} className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold">
              <Icon name="sparkles" size="xs" />
              <span>AI Travel Intelligence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground leading-tight">
              Personalized AI itineraries & NLP search.
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Nearby's neural travel companion interprets natural language travel queries, analyzes user constraints, and solves multi-stop TSP routes in milliseconds.
            </p>

            {/* Feature List */}
            <div className="space-y-3 pt-2 text-left">
              <div className="flex items-start gap-3 p-3 rounded-sm border border-border/60 bg-card/60">
                <Icon name="search" size="sm" className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Natural Language Vector Search</h4>
                  <p className="text-[11px] text-muted-foreground">Search by vibe, budget, or activity type without rigid filters.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-sm border border-border/60 bg-card/60">
                <Icon name="route" size="sm" className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Multi-Constraint TSP Route Solver</h4>
                  <p className="text-[11px] text-muted-foreground">Optimal route ordering minimizing travel time between destination stops.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/ai-itinerary">
                <Button size="lg" className="rounded-sm bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shadow-md">
                  <Icon name="sparkles" size="xs" />
                  <span>Generate AI Itinerary</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default AICompanionSection
