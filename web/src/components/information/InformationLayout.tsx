import React, { useEffect, useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { LayeredBackground } from '@/components/background/LayeredBackground'
import { InformationHero, type InformationHeroProps } from './InformationHero'
import { PageHeader, type BreadcrumbItem } from './PageHeader'
import { InfoSidebar } from './InfoSidebar'
import { RelatedLinks, type RelatedLink } from './RelatedLinks'
import type { TOCItem } from './TableOfContents'
import { Icon } from '@/components/common/Icon'

export interface InformationLayoutProps {
  hero: InformationHeroProps
  breadcrumbs: BreadcrumbItem[]
  tocItems: TOCItem[]
  relatedLinks?: RelatedLink[]
  children: React.ReactNode
}

export const InformationLayout: React.FC<InformationLayoutProps> = ({
  hero,
  breadcrumbs,
  tocItems,
  relatedLinks = [],
  children,
}) => {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <LayeredBackground>
      {/* Top Window Scroll Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] origin-left"
        style={{ scaleX }}
      />

      <main className="pt-8 pb-20">
        <div className="mx-auto max-w-7xl px-6 space-y-8">
          {/* Breadcrumb Navigation */}
          <PageHeader breadcrumbs={breadcrumbs} />

          {/* Hero Banner */}
          <InformationHero {...hero} />

          {/* Main Grid: Content (8 cols) + InfoSidebar (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <article className="lg:col-span-8 space-y-8 font-sans">{children}</article>
            <div className="lg:col-span-4 hidden lg:block">
              <InfoSidebar tocItems={tocItems} />
            </div>
          </div>

          {/* Related Links Section */}
          {relatedLinks.length > 0 && <RelatedLinks links={relatedLinks} />}
        </div>
      </main>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-card text-foreground shadow-lg backdrop-blur-md hover:border-primary hover:text-primary transition-all"
          aria-label="Back to top"
        >
          <Icon name="arrow-right" size="sm" className="-rotate-90" />
        </motion.button>
      )}
    </LayeredBackground>
  )
}
