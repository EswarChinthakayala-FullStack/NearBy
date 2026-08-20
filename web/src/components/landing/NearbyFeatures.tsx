import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapNavigationSVG } from '@/components/illustrations/MapNavigationSVG'
import { ExploreWorldSVG } from '@/components/illustrations/ExploreWorldSVG'

export const NearbyFeatures: React.FC = () => {
  return (
    <section className="py-24 relative space-y-24">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Spotlight Feature 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="accent" className="gap-1">
              <Icon name="navigation" size="xs" /> Offline Intelligence
            </Badge>
            <h3 className="text-3xl font-black font-heading text-foreground">
              Never Lose Your Way, Even Without Cellular Data
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nearby caches vector tiles, place details, and emergency navigation routes locally on your device. Travel through remote mountain passes or ocean beaches with complete offline confidence.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link to="/map-radar">
                <Button variant="default" size="sm" className="gap-1.5 rounded-sm">
                  <Icon name="offline" size="xs" /> Download Regional Pack
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <MapNavigationSVG className="w-full" />
          </div>
        </div>

        {/* Spotlight Feature 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center">
            <ExploreWorldSVG className="w-full" />
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <Badge variant="accent" className="gap-1">
              <Icon name="sparkles" size="xs" /> Authentic Reviews
            </Badge>
            <h3 className="text-3xl font-black font-heading text-foreground">
              Community Ratings Free From Spam or Fake Reviews
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every review on Nearby is verified against GPS presence and timestamp logs, ensuring you read genuine traveler experiences and trustworthy ratings.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link to="/places">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-sm">
                  <Icon name="ratings" size="xs" /> Read Verified Reviews
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default NearbyFeatures
