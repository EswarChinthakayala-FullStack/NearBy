import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon, type IconName } from '@/components/common/Icon'

export interface NavLinkConfig {
  label: string
  href: string
  icon?: IconName
  description?: string
}

export interface DesktopNavigationProps {
  links: NavLinkConfig[]
  className?: string
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  links,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav
      aria-label="Main Navigation"
      className={`hidden md:flex items-center relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Main Single Heading Trigger Button */}
      <button
        type="button"
        className={`flex h-9 items-center gap-2 rounded-sm border border-border/80 bg-card/80 px-3.5 text-xs font-semibold text-foreground hover:bg-card hover:border-emerald-500/50 transition-all shadow-2xs ${
          isOpen ? 'border-emerald-500/60 bg-card text-emerald-400' : ''
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <Icon name="places" size="xs" className="text-emerald-400" />
        <span>Explore Platform</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : 'text-muted-foreground'}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Hover Dropdown Menu Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 w-96 rounded-sm border border-border/90 bg-card/95 p-3 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden"
          >
            <div className="px-2 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-2">
              Platform Features & Destinations
            </div>

            <div className="grid grid-cols-1 gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 rounded-sm p-2 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors group"
                >
                  {link.icon && (
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border/60 bg-muted/60 text-muted-foreground group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                      <Icon name={link.icon} size="xs" />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                      {link.label}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {link.description || `Explore verified ${link.label.toLowerCase()} on Nearby.`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default DesktopNavigation
