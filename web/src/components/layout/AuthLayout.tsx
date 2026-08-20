import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppLogo } from '@/components/common/AppLogo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Icon } from '@/components/common/Icon'
import { AmbientBackground } from '@/components/background/AmbientBackground'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Ambient Mesh Glow Background */}
      <AmbientBackground />

      {/* Centered Single Auth Panel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-6 rounded-sm border border-border bg-card/90 backdrop-blur-xl p-8 shadow-2xl z-10 my-auto"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center pb-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <AppLogo size="md" />
            </Link>
          </div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
        </div>

        {children}
      </motion.div>

      {/* Floating Bottom-Right Control Bar — Brand Icon + ThemeToggle */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border p-1.5 rounded-sm shadow-lg">
        <Link
          to="/"
          className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Return to Explorer"
          aria-label="Return to Explorer"
        >
          <Icon name="navigation" size="xs" />
        </Link>
        <div className="h-4 w-px bg-border" />
        <ThemeToggle />
      </div>
    </div>
  )
}

export default AuthLayout
