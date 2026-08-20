import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { Icon } from '@/components/common/Icon'
import { PageTransition } from '@/components/common/PageTransition'

export const MainLayout: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 30 })

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
    <div className="min-h-screen bg-background text-foreground flex flex-col relative">
      {/* Top Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-50 pointer-events-none"
      />

      {/* Offline Connectivity Banner */}
      <OfflineBanner />

      {/* Main Sticky Navbar */}
      <Navbar />

      {/* Content Route Render Area */}
      <main className="flex-1 w-full relative z-10 pt-20">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      {/* Back To Top Floating Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-card/90 text-foreground shadow-xl backdrop-blur-md hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 transition-all focus-visible:outline-2 focus-visible:outline-emerald-500"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <Icon name="arrow-right" size="xs" className="-rotate-90" />
        </motion.button>
      )}

      {/* Enterprise Footer */}
      <Footer />
    </div>
  )
}

export default MainLayout
