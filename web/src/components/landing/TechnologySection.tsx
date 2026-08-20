import React from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/common/Icon'
import { fadeInUp, staggerContainer } from '@/lib/motion-variants'

interface TechItem {
  name: string
  desc: string
  icon: IconName
}

export const TechnologySection: React.FC = () => {
  const techStack: TechItem[] = [
    { name: 'FastAPI Backend', desc: 'Asynchronous Python framework with OpenAPI contracts.', icon: 'settings' },
    { name: 'React 19 & Vite', desc: 'Cutting-edge frontend runtime with zero-bundle overhead.', icon: 'sparkles' },
    { name: 'OpenStreetMap & OSRM', desc: 'Open data spatial engine for route planning.', icon: 'map' },
    { name: 'MySQL Database', desc: 'Relational data persistence with strict spatial indexes.', icon: 'grid' },
  ]

  return (
    <section className="py-20 bg-background text-foreground relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
            <Icon name="settings" size="xs" />
            <span>Architecture & Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
            Engineered for performance & scale.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Built using modern, resilient open technology to deliver sub-50ms API responses and spatial searches.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              variants={fadeInUp}
              className="p-6 rounded-sm border border-border/70 bg-card/50 backdrop-blur-md space-y-3 shadow-sm hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 font-bold">
                <Icon name={tech.icon} size="sm" />
              </div>
              <h3 className="text-sm font-bold text-foreground font-heading">{tech.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{tech.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TechnologySection
