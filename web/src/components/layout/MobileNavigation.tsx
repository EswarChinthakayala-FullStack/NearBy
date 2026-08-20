import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AppLogo } from '@/components/common/AppLogo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { UserMenu } from './UserMenu'
import { OnlineStatus } from './OnlineStatus'
import type { NavLinkConfig } from './DesktopNavigation'
import { staggerContainer, fadeInUp } from '@/lib/motion-variants'

export interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  links: NavLinkConfig[]
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  links,
}) => {
  const { user } = useAuthStore()
  const location = useLocation()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-80 sm:w-96 bg-card/95 backdrop-blur-2xl border-l border-border p-0 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Sheet Header */}
          <SheetHeader className="p-6 border-b border-border flex items-center justify-between">
            <SheetTitle>
              <Link to="/" onClick={onClose} className="flex items-center gap-2">
                <AppLogo size="sm" />
              </Link>
            </SheetTitle>
          </SheetHeader>

          {/* Staggered Navigation Items */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="p-6 space-y-2"
          >
            {links.map((link) => {
              const isActive = location.pathname === link.href

              return (
                <motion.div key={link.href} variants={fadeInUp}>
                  <Link
                    to={link.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {link.icon && <Icon name={link.icon} size="sm" className="shrink-0" />}
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Footer / Controls Section */}
        <div className="p-6 border-t border-border bg-muted/20 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <OnlineStatus className="h-9" />
            <ThemeToggle variant="buttons" className="h-9" />
          </div>

          {user ? (
            <div className="pt-2">
              <UserMenu />
            </div>
          ) : (
            <div className="pt-2">
              <Link to="/login" onClick={onClose}>
                <Button variant="default" size="sm" className="w-full h-9 text-xs font-semibold gap-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white">
                  <Icon name="arrow-right" size="xs" />
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNavigation
