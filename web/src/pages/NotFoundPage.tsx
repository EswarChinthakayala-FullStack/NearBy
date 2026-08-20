import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { AmbientBackground } from '@/components/background/AmbientBackground'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6 relative overflow-hidden">
      {/* Ambient Mesh Glow Background */}
      <AmbientBackground />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full text-center space-y-6 rounded-sm border border-border bg-card/90 backdrop-blur-xl p-8 shadow-2xl z-10"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
          <Icon name="navigation" size="lg" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase">
            Error 404 — Route Not Found
          </span>
          <h1 className="text-3xl font-black font-heading tracking-tight text-foreground">
            Off the Mapped Radar
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested travel destination or platform URL does not exist or has been relocated to another coordinate.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full h-10 px-5 rounded-sm gap-2 text-xs font-semibold">
              <Icon name="navigation" size="xs" />
              <span>Explore Home Radar</span>
            </Button>
          </Link>

          <Link to="/map-radar" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full h-10 px-5 rounded-sm gap-2 text-xs font-semibold">
              <Icon name="map" size="xs" />
              <span>View Map Radar</span>
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Bottom-Right Controls — Icon-Only with rounded-sm */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border p-1.5 rounded-sm shadow-lg">
        <Link
          to="/"
          className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Back to Explorer"
          aria-label="Back to Explorer"
        >
          <Icon name="navigation" size="xs" />
        </Link>
        <div className="h-4 w-px bg-border" />
        <ThemeToggle variant="icon-buttons" />
      </div>
    </div>
  )
}

export default NotFoundPage
