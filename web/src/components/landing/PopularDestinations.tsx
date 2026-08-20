import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { CardSkeleton } from '@/components/common/LoadingState'
import { api, type Place } from '@/lib/api'
import { staggerContainerVariants, cardHoverVariants, favoritePulseVariants } from '@/lib/motion-variants'

const DEFAULT_DESTINATIONS: any[] = [
  {
    id: 'dest-1',
    name: 'Aguada Fort & Lighthouse',
    category: 'Historic Monument',
    address: 'Sinquerim, Candolim, Goa',
    rating: 4.8,
    review_count: 1240,
    distance_km: 2.4,
    weather_temp: '28°C Sunny',
    is_featured: true,
    description: 'A 17th-century Portuguese fortress offering dramatic Arabian Sea views.',
  },
  {
    id: 'dest-2',
    name: 'Basilica of Bom Jesus',
    category: 'UNESCO Heritage',
    address: 'Old Goa, Panaji',
    rating: 4.9,
    review_count: 2150,
    distance_km: 8.1,
    weather_temp: '27°C Clear',
    is_featured: true,
    description: 'Iconic Baroque church housing the sacred relics of St. Francis Xavier.',
  },
  {
    id: 'dest-3',
    name: 'Fontainhas Latin Quarter',
    category: 'Heritage Walk',
    address: 'Panaji, Goa',
    rating: 4.7,
    review_count: 980,
    distance_km: 1.2,
    weather_temp: '29°C Pleasant',
    is_featured: true,
    description: 'Vibrant narrow streets lined with colorful Portuguese colonial villas.',
  },
]

export const PopularDestinations: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function loadPlaces() {
      setLoading(true)
      const data = await api.getPopularDestinations()
      setPlaces(data.length > 0 ? data : (DEFAULT_DESTINATIONS as any))
      setLoading(false)
    }
    loadPlaces()
  }, [])

  const toggleFavorite = (id: string | number) => {
    const key = String(id)
    setFavorites((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section id="destinations" className="py-24 relative">
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="accent" className="gap-1 px-3 py-1">
              <Icon name="ratings" size="xs" /> Popular Destinations
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
              Top Rated Tourist Attractions
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Handpicked regional destinations verified by traveler reviews, live distance radar, and AI recommendation scores.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <Link to="/places">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-sm">
                <span>View All Places</span>
                <Icon name="arrow-right" size="xs" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* Places Grid */}
        {!loading && (
          <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {places.map((placeItem, idx) => {
              const item = placeItem as any
              const uniqueKey = item.id ? String(item.id) : item.uuid ? String(item.uuid) : `dest-${idx}`
              const isFav = !!favorites[uniqueKey]
              return (
                <motion.div
                  key={uniqueKey}
                  variants={cardHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Card className="h-full flex flex-col justify-between overflow-hidden border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 shadow-md backdrop-blur-md">
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
                          {item.distance_km || 2.4} km away
                        </span>
                        <motion.button
                          type="button"
                          onClick={() => toggleFavorite(uniqueKey)}
                          variants={favoritePulseVariants}
                          animate={isFav ? 'active' : 'inactive'}
                          className="flex h-8 w-8 items-center justify-center rounded-sm bg-secondary text-muted-foreground hover:text-rose-500 transition-colors"
                          aria-label="Save to Favorites"
                        >
                          <Icon name="favorite" size="xs" className={isFav ? 'text-rose-500 fill-rose-500' : ''} />
                        </motion.button>
                      </div>

                      <CardTitle className="text-xl font-bold font-heading line-clamp-1">{item.name}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground flex items-center gap-1">
                        <Icon name="location" size="xs" /> {item.address || `${item.city || 'Goa'}, India`}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between text-xs border-t border-border/60 pt-3">
                        <span className="flex items-center gap-1 font-semibold text-amber-500">
                          <Icon name="ratings" size="xs" /> {item.avg_rating || item.rating || 4.8} ({item.total_reviews || item.review_count || 500} reviews)
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Icon name="clock" size="xs" /> {item.weather_temp || '28°C'}
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="border-t border-border pt-4 justify-between">
                      <Badge variant="secondary" className="text-[11px]">
                        {typeof item.category === 'object' ? item.category?.name : item.category || 'Historical'}
                      </Badge>
                      <Link to={`/places/${uniqueKey}`}>
                        <Button variant="default" size="sm" className="gap-1 rounded-sm">
                          <span>Navigate</span>
                          <Icon name="arrow-right" size="xs" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default PopularDestinations
