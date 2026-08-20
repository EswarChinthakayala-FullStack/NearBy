import React from 'react'
import { Link } from 'react-router-dom'
import { AppLogo } from '@/components/common/AppLogo'
import { Icon } from '@/components/common/Icon'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { FooterSection } from './FooterSection'
import { FooterLink } from './FooterLink'

export const Footer: React.FC = () => {
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0'
  const environment = import.meta.env.VITE_APP_ENV || 'Production'

  return (
    <footer className="border-t border-border bg-card/85 pt-16 pb-12 relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <AppLogo size="md" />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Nearby is an enterprise AI location guidance platform offering real-time spatial radar, intelligent itinerary generation, and verified traveler content.
            </p>
            <div className="pt-2">
              <ThemeToggle variant="buttons" />
            </div>
          </div>

          {/* Platform Link Group */}
          <FooterSection title="Platform">
            <li><FooterLink to="/places" label="Explore Places" icon="places" /></li>
            <li><FooterLink to="/categories" label="Tourism Categories" icon="categories" /></li>
            <li><FooterLink to="/map-radar" label="Map Radar" icon="map" /></li>
            <li><FooterLink to="/ai-itinerary" label="AI Itinerary Planner" icon="sparkles" /></li>
            <li><FooterLink to="/features/ai-search" label="AI Vector Search" icon="search" /></li>
          </FooterSection>

          {/* Resources Link Group */}
          <FooterSection title="Resources">
            <li><FooterLink to="/docs/api" label="REST API Docs" icon="route" /></li>
            <li><FooterLink to="/resources/travel-guides" label="Travel Guides" icon="location" /></li>
            <li><FooterLink to="/community" label="Community Forum" icon="user" /></li>
            <li><FooterLink to="/system-status" label="System Health" icon="online" /></li>
          </FooterSection>

          {/* Legal Link Group */}
          <FooterSection title="Legal & Privacy">
            <li><FooterLink to="/privacy" label="Privacy Policy" icon="shield" /></li>
            <li><FooterLink to="/terms" label="Terms of Service" icon="info" /></li>
            <li><FooterLink to="/location-security" label="Location Security" icon="lock" /></li>
            <li><FooterLink to="/cookies" label="Cookie Preferences" icon="settings" /></li>
          </FooterSection>

          {/* Company & Support Group */}
          <FooterSection title="Community">
            <li><FooterLink to="/community" label="Help Center" icon="info" /></li>
            <li><FooterLink to="/community" label="Report Issue" icon="warning" /></li>
            <li>
              <FooterLink
                href="https://github.com"
                label="GitHub Repo"
                icon="external-link"
                external
              />
            </li>
          </FooterSection>
        </div>

        {/* Mandatory Open Knowledge Data Attribution */}
        <div className="rounded-sm border border-border/80 bg-muted/30 p-4 space-y-2 text-xs text-muted-foreground backdrop-blur-sm">
          <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold uppercase text-[10px]">
            <Icon name="sparkles" size="xs" /> Open Knowledge & Spatial Data Attribution
          </div>
          <p className="leading-relaxed">
            Nearby platform relies on open spatial data and Wikimedia knowledge standards to ensure accurate geographical context and traveler information.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-foreground pt-1">
            <span><strong className="text-muted-foreground">Map Data:</strong> OpenStreetMap</span>
            <span>•</span>
            <span><strong className="text-muted-foreground">Content:</strong> Wikipedia</span>
            <span>•</span>
            <span><strong className="text-muted-foreground">Media:</strong> Wikimedia Commons</span>
            <span>•</span>
            <span><strong className="text-muted-foreground">Routing:</strong> OSRM</span>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Nearby Platform Technologies. All rights reserved.</p>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="rounded bg-muted px-2 py-0.5 border border-border font-bold text-foreground">
              v{version} ({environment})
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
