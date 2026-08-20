import React from 'react'
import { InformationLayout } from '@/components/information/InformationLayout'
import { SectionCard } from '@/components/information/SectionCard'
import { CalloutBox } from '@/components/information/CalloutBox'
import { FAQAccordion } from '@/components/information/FAQAccordion'
import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls } from '@/components/ui/map'

export const MapRadarPage: React.FC = () => {
  const breadcrumbs = [
    { label: 'Platform', href: '/#map-preview' },
    { label: 'Live Location Radar & GIS Architecture' },
  ]

  const tocItems = [
    { id: 'radar-overview', title: 'Radar Overview' },
    { id: 'gps-telemetry', title: 'GPS Telemetry & Accuracy' },
    { id: 'gis-map-demo', title: 'Live Interactive GIS Map' },
    { id: 'offline-tiles', title: 'Offline Vector Tile Caching' },
    { id: 'faq', title: 'Map Radar FAQ' },
  ]

  const relatedLinks = [
    {
      title: 'Location Security Architecture',
      description: 'Review our zero-trace GPS privacy protocols.',
      href: '/location-security',
      iconName: 'shield' as const,
    },
    {
      title: 'AI Search Integration',
      description: 'Learn how radar coordinates filter natural language prompts.',
      href: '/features/ai-search',
      iconName: 'sparkles' as const,
    },
  ]

  const faqItems = [
    {
      question: 'Does Nearby track my GPS location continuously in the background?',
      answer: 'No. GPS location is accessed only when you explicitly interact with the Map Radar or request live distance sweeps. Background tracking is strictly opt-in.',
    },
    {
      question: 'Does the Map Radar work without cellular data?',
      answer: 'Yes. Offline vector map tiles can be cached locally for active destination regions, allowing radar sweeps and distance calculations to operate in remote areas.',
    },
  ]

  return (
    <InformationLayout
      hero={{
        title: 'Live Location Radar & GIS Architecture',
        description: 'Deep dive into Nearby\'s real-time spatial positioning engine, high-precision GPS telemetry, and offline vector tile cache.',
        category: 'Spatial Engineering',
        iconName: 'map',
        lastUpdatedDate: 'July 26, 2026',
        version: 'v1.0.0 Enterprise',
      }}
      breadcrumbs={breadcrumbs}
      tocItems={tocItems}
      relatedLinks={relatedLinks}
    >
      {/* Section 1: Radar Overview */}
      <SectionCard id="radar-overview" title="Radar Spatial Overview" iconName="map" badgeText="Spatial Engine">
        <p className="text-xs text-muted-foreground leading-relaxed">
          The Nearby Map Radar combines WGS 84 geographic coordinates, Haversine distance equations, and MapLibre GL rendering to provide sub-meter spatial positioning relative to nearby points of interest.
        </p>

        <CalloutBox type="info" title="Dynamic Radius Sweeps">
          Distance sweeps automatically adjust between 500 meters (walking distance) and 50 kilometers (regional day trips) depending on your speed and transport mode.
        </CalloutBox>
      </SectionCard>

      {/* Section 2: GPS Telemetry & Accuracy */}
      <SectionCard id="gps-telemetry" title="GPS Telemetry & Precision" iconName="location" badgeText="Sub-Meter Accuracy">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Our spatial engine utilizes HTML5 Geolocation API, Wi-Fi tri-lateration, and cell-tower fallback data. Latitude and longitude coordinates are processed locally on-device before querying nearby destination indices.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="rounded-sm border border-border/60 bg-muted/30 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">High Precision Mode</span>
            <p className="text-sm font-bold text-teal-400">± 3 to 5 Meters</p>
            <p className="text-[11px] text-muted-foreground">Active GPS Satellites</p>
          </div>
          <div className="rounded-sm border border-border/60 bg-muted/30 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">Standard Urban Mode</span>
            <p className="text-sm font-bold text-amber-400">± 10 to 15 Meters</p>
            <p className="text-[11px] text-muted-foreground">Wi-Fi & Cell Triangulation</p>
          </div>
          <div className="rounded-sm border border-border/60 bg-muted/30 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">Battery Saver Mode</span>
            <p className="text-sm font-bold text-sky-400">± 50 to 100 Meters</p>
            <p className="text-[11px] text-muted-foreground">Coarse Network Position</p>
          </div>
        </div>
      </SectionCard>

      {/* Section 3: Live Interactive GIS Map */}
      <SectionCard id="gis-map-demo" title="Live Interactive GIS Map Component" iconName="map" badgeText="MapLibre GL">
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Test our MapLibre-GL map component below. Click any marker to view location tooltips and details.
        </p>

        <div className="h-[380px] w-full rounded-sm border border-border overflow-hidden">
          <Map className="h-full w-full" center={[73.834, 15.498]} zoom={10.5}>
            <MapMarker longitude={73.7738} latitude={15.4925}>
              <MarkerContent>
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold text-xs shadow-md border border-white/40">1</div>
              </MarkerContent>
              <MarkerTooltip>Aguada Fort & Lighthouse</MarkerTooltip>
            </MapMarker>
            <MapMarker longitude={73.7553} latitude={15.5438}>
              <MarkerContent>
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold text-xs shadow-md border border-white/40">2</div>
              </MarkerContent>
              <MarkerTooltip>Calangute Beach</MarkerTooltip>
            </MapMarker>
            <MapControls position="bottom-right" showZoom showCompass />
          </Map>
        </div>
      </SectionCard>

      {/* Section 4: Offline Vector Tile Caching */}
      <SectionCard id="offline-tiles" title="Offline Vector Tile Caching" iconName="offline" badgeText="Service Worker Cache">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Vector tiles (`.pbf` compressed protocol buffers) are cached using Progressive Web App Service Workers. When traveling in low-connectivity areas, cached tiles enable instant map zooming and pan operations without latency.
        </p>
      </SectionCard>

      {/* Section 5: FAQ */}
      <SectionCard id="faq" title="Map Radar FAQ" iconName="info" badgeText="Help">
        <FAQAccordion items={faqItems} />
      </SectionCard>
    </InformationLayout>
  )
}

export default MapRadarPage
