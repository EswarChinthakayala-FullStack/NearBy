import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AppLogo } from '@/components/common/AppLogo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { UserMenu } from './UserMenu'
import { SearchDialog } from './SearchDialog'
import { OnlineStatus } from './OnlineStatus'
import { DesktopNavigation, type NavLinkConfig } from './DesktopNavigation'
import { MobileNavigation } from './MobileNavigation'

const NAV_LINKS: NavLinkConfig[] = [
  { label: 'Browse Places', href: '/browse', icon: 'places', description: 'Search and filter all verified tourism destinations.' },
  { label: 'Categories', href: '/categories', icon: 'categories', description: 'Browse by nature, heritage, food, beaches & culture.' },
  { label: 'Nearby Radar', href: '/nearby', icon: 'map', description: 'Real-time GPS spatial radar discovery.' },
  { label: 'AI Search', href: '/ai-search', icon: 'sparkles', description: 'Natural language search assistant for travelers.' },
  { label: 'AI Itinerary Planner', href: '/ai-itinerary', icon: 'route', description: 'Multi-day intelligent neural trip generator.' },
  { label: 'User Portal', href: '/user/dashboard', icon: 'profile', description: 'Manage account, saved spots, reviews & itineraries.' },
]

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-close mobile sidebar drawer when expanding window to desktop size (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Global CMD+K / CTRL+K Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'py-2.5 bg-card/85 backdrop-blur-xl border-b border-border/80 shadow-md'
            : 'py-3.5 bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group focus-visible:outline-2 focus-visible:outline-emerald-500 rounded-sm">
            <AppLogo size="md" />
          </Link>

          {/* Right Controls Group (Explore Platform Dropdown + Search + Status + Auth) */}
          <div className="hidden md:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Explore Platform Dropdown (Next to search trigger) */}
            <DesktopNavigation links={NAV_LINKS} />

            {/* Compact Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 items-center gap-1.5 sm:gap-2 rounded-sm border border-border bg-card/80 px-3 text-xs text-muted-foreground hover:text-foreground hover:border-emerald-500/40 transition-colors font-mono shadow-2xs focus-visible:outline-2 focus-visible:outline-emerald-500"
              aria-label="Open search dialog"
            >
              <Icon name="search" size="xs" />
              <span className="hidden xl:inline">Search spots...</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] border border-border font-bold">
                ⌘K
              </kbd>
            </button>

            <div className="hidden xl:block">
              <OnlineStatus className="h-9" />
            </div>

            <ThemeToggle variant="icon-only" className="h-9 w-9 rounded-sm" />

            {/* Authentication State */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={user.role === 'admin' ? '/admin' : '/user/dashboard'}>
                  <Button variant="default" size="sm" className="h-9 rounded-sm text-xs font-semibold gap-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs">
                    <Icon name="navigation" size="xs" />
                    <span>Launch App</span>
                  </Button>
                </Link>
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link to="/login">
                  <Button variant="default" size="sm" className="h-9 rounded-sm text-xs font-semibold gap-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs">
                    <Icon name="arrow-right" size="xs" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-card text-foreground shadow-2xs"
              aria-label="Search"
            >
              <Icon name="search" size="sm" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-card text-foreground shadow-2xs"
              aria-label="Open Mobile Navigation Menu"
            >
              <Icon name="menu" size="md" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Sheet */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        links={NAV_LINKS}
      />

      {/* Global Search Dialog Modal */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

export default Navbar
