import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { AmbientBackground } from '@/components/background/AmbientBackground'

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6 relative overflow-hidden">
      {/* Ambient Radial Mesh Background */}
      <AmbientBackground />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full text-center space-y-6 rounded-sm border border-border bg-card/90 backdrop-blur-xl p-8 shadow-2xl z-10"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
          <Icon name="shield" size="lg" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold font-mono tracking-widest text-amber-500 uppercase">
            Error 403 — Access Restricted
          </span>
          <h1 className="text-3xl font-black font-heading tracking-tight text-foreground">
            Administrative Access Denied
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You do not possess the required system privileges or role permission to access this administrative control route.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full h-10 px-5 rounded-sm gap-2 text-xs font-semibold">
              <Icon name="navigation" size="xs" />
              <span>Return to Safety</span>
            </Button>
          </Link>

          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full h-10 px-5 rounded-sm gap-2 text-xs font-semibold">
              <Icon name="sparkles" size="xs" />
              <span>Switch Account</span>
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

export default ForbiddenPage
