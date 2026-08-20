import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Icon, type IconName } from '@/components/common/Icon'
import {
  pageTransitionVariants,
  staggerContainerVariants,
  staggerItemVariants,
  cardHoverVariants,
  buttonPressVariants,
  favoritePulseVariants,
  modalVariants,
} from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Spinner,
  CardSkeleton,
  TableLoader,
  ProgressIndicator,
} from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'

export function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'components' | 'motion' | 'states'>('tokens')
  const [isLiked, setIsLiked] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [progress, setProgress] = useState(65)

  const iconList: IconName[] = [
    'navigation',
    'search',
    'location',
    'ratings',
    'favorite',
    'clock',
    'gallery',
    'map',
    'profile',
    'settings',
    'admin',
    'notifications',
    'empty',
    'offline',
    'error',
    'success',
  ]

  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20"
    >
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-md shadow-teal-600/20">
              <Icon name="navigation" size="lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-heading leading-tight tracking-tight">
                Local Tourism Guide <span className="text-primary font-normal text-xs ml-2 rounded-sm bg-secondary px-2 py-0.5 border border-primary/20">UI System v1.0</span>
              </h1>
              <p className="text-xs text-muted-foreground">Enterprise Design System & Token Foundation</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle variant="buttons" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 pt-8 space-y-12">

        {/* Hero & Navigation Tabs */}
        <section className="space-y-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
            <div className="space-y-2">
              <Badge variant="accent" className="gap-1">
                <Icon name="sparkles" size="xs" /> Enterprise Grade Visual Language
              </Badge>
              <h2 className="text-3xl font-extrabold font-heading tracking-tight sm:text-4xl text-foreground">
                Design System Foundation
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Centralized theme engine, OKLCH/Hex token scales, Framer Motion variant registry, Hugeicons wrapper, and customized shadcn/ui components.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 rounded-sm border border-border bg-muted/50 p-1.5 self-start">
              {(['tokens', 'components', 'motion', 'states'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-sm px-4 py-2 text-xs font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-card text-foreground shadow-xs ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* TAB 1: DESIGN TOKENS & COLOR SYSTEM */}
        {activeTab === 'tokens' && (
          <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="space-y-10"
          >
            {/* Color Tokens */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                <Icon name="sparkles" className="text-primary" /> Brand & Semantic Color Tokens
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Primary Emerald */}
                <motion.div variants={staggerItemVariants} className="rounded-sm border border-border bg-card p-4 space-y-3 shadow-xs">
                  <div className="h-16 w-full rounded-sm bg-primary flex items-end p-2 justify-end">
                    <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">#0D9488</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Primary Brand</h4>
                    <p className="text-xs text-muted-foreground">Emerald / Teal (Buttons, Active Nav, Focus Ring)</p>
                  </div>
                </motion.div>

                {/* Secondary Surface */}
                <motion.div variants={staggerItemVariants} className="rounded-sm border border-border bg-card p-4 space-y-3 shadow-xs">
                  <div className="h-16 w-full rounded-sm bg-secondary flex items-end p-2 justify-end border border-primary/10">
                    <span className="text-xs font-mono font-bold text-secondary-foreground bg-primary/10 px-2 py-0.5 rounded">#F0FBFA</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Secondary Surface</h4>
                    <p className="text-xs text-muted-foreground">Light Teal Tint (Cards, Tags, Subtle Filters)</p>
                  </div>
                </motion.div>

                {/* Amber Accent */}
                <motion.div variants={staggerItemVariants} className="rounded-sm border border-border bg-card p-4 space-y-3 shadow-xs">
                  <div className="h-16 w-full rounded-sm bg-amber-500 flex items-end p-2 justify-end">
                    <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">#F59E0B</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Accent (Amber)</h4>
                    <p className="text-xs text-muted-foreground">Ratings, Highlights, Review Stars, Featured</p>
                  </div>
                </motion.div>

                {/* Destructive Red */}
                <motion.div variants={staggerItemVariants} className="rounded-sm border border-border bg-card p-4 space-y-3 shadow-xs">
                  <div className="h-16 w-full rounded-sm bg-destructive flex items-end p-2 justify-end">
                    <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">#DC2626</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Destructive</h4>
                    <p className="text-xs text-muted-foreground">Dangerous actions, Errors, Removal</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Typography Scale */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                <Icon name="profile" className="text-primary" /> Typography Hierarchy (Poppins + Inter)
              </h3>
              <div className="rounded-sm border border-border bg-card p-6 space-y-6 shadow-xs">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-muted-foreground">Font Heading (Poppins 700) — Hero / H1</span>
                  <h1 className="text-3xl font-extrabold font-heading text-foreground">Discover Historic Monuments & Hidden Gems</h1>
                </div>
                <div className="space-y-1 border-t border-border pt-4">
                  <span className="text-xs font-mono text-muted-foreground">Font Heading (Poppins 600) — H2 Title</span>
                  <h2 className="text-xl font-bold font-heading text-foreground">Featured Tourist Attractions</h2>
                </div>
                <div className="space-y-1 border-t border-border pt-4">
                  <span className="text-xs font-mono text-muted-foreground">Font Sans (Inter 400 & 600) — Body & Interface Labels</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Explore curated guides, authentic local reviews, and real-time navigation tailored to your travel itinerary. Every UI element follows standard WCAG contrast ratios.
                  </p>
                </div>
              </div>
            </div>

            {/* Hugeicons Centralized Wrapper */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading flex items-center gap-2">
                <Icon name="navigation" className="text-primary" /> Centralized Hugeicons Wrapper (`Icon.tsx`)
              </h3>
              <p className="text-xs text-muted-foreground">
                All icons are rendered strictly using <code className="text-primary font-mono">&lt;Icon name="..." /&gt;</code> with standardized size, stroke width, and accessibility attributes.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {iconList.map((iconName) => (
                  <div
                    key={iconName}
                    className="flex flex-col items-center justify-center gap-2 rounded-sm border border-border bg-card p-3 text-center shadow-xs hover:border-primary/50 transition-colors"
                  >
                    <Icon name={iconName} size="lg" className="text-primary" />
                    <span className="text-[11px] font-medium text-muted-foreground truncate w-full">{iconName}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CUSTOMIZED SHADCN/UI COMPONENTS */}
        {activeTab === 'components' && (
          <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="space-y-10"
          >
            {/* Buttons Showcase */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">Buttons & Interactive States</h3>
              <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-card p-6">
                <Button variant="default">Primary Emerald</Button>
                <Button variant="secondary">Secondary Teal</Button>
                <Button variant="accent">Accent Amber</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="default" disabled>Disabled</Button>
                <Button variant="default" className="gap-2">
                  <Spinner size="xs" /> Loading...
                </Button>
              </div>
            </div>

            {/* Badges Showcase */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">Badges & Tags</h3>
              <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-card p-6">
                <Badge variant="default">Primary Tag</Badge>
                <Badge variant="secondary">Secondary Surface</Badge>
                <Badge variant="accent">
                  <Icon name="ratings" size="xs" className="text-amber-500" /> 4.9 Superb
                </Badge>
                <Badge variant="success">
                  <Icon name="success" size="xs" /> Verified Guide
                </Badge>
                <Badge variant="destructive">Closed Today</Badge>
                <Badge variant="outline">Historic Site</Badge>
              </div>
            </div>

            {/* Inputs & Form Controls */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">Inputs & Focus Rings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-sm border border-border bg-card p-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Search Destination</label>
                  <div className="relative">
                    <Icon name="search" size="sm" className="absolute left-3 top-2.5 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search places, museums, beaches..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Your Location</label>
                  <div className="relative">
                    <Icon name="location" size="sm" className="absolute left-3 top-2.5 text-primary" />
                    <Input className="pl-9" defaultValue="Panaji, Goa, India" />
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Showcase */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">Card Architecture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="accent">Featured Attraction</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Icon name="clock" size="xs" /> Open 9 AM - 6 PM
                      </span>
                    </div>
                    <CardTitle className="text-lg mt-2">Aguada Fort & Lighthouse</CardTitle>
                    <CardDescription>17th-century Portuguese fortress overlooking the Arabian Sea.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Popular destination for panoramic sunset views, historic military architecture, and coastal walks.
                    </p>
                  </CardContent>
                  <CardFooter className="justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                      <Icon name="ratings" size="sm" /> 4.8 (1,240 reviews)
                    </div>
                    <Button variant="default" size="sm">Explore Place</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit">Local Food & Dining</Badge>
                    <CardTitle className="text-lg mt-2">Fisherman's Wharf</CardTitle>
                    <CardDescription>Authentic Goan seafood curries and riverfront dining.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Enjoy traditional musical performances alongside signature crab xec xec and fresh fish caldine.
                    </p>
                  </CardContent>
                  <CardFooter className="justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                      <Icon name="ratings" size="sm" /> 4.6 (890 reviews)
                    </div>
                    <Button variant="outline" size="sm">View Menu</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: MOTION SYSTEM & INTERACTION */}
        {activeTab === 'motion' && (
          <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="space-y-10"
          >
            {/* Card Hover Lift & Heart Pulse Toggle */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">Interactive Micro-Animations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Interactive Lift Card */}
                <motion.div
                  variants={cardHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="rounded-sm border border-border bg-card p-6 shadow-xs space-y-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <Icon name="navigation" size="lg" className="text-primary" />
                    <span className="text-xs font-semibold text-primary">Hover & Lift</span>
                  </div>
                  <h4 className="font-bold text-base">Card Hover Lift</h4>
                  <p className="text-xs text-muted-foreground">
                    Subtle spring elevation with scale effect defined in `motion-variants.ts`.
                  </p>
                </motion.div>

                {/* Favorite Heart Pulse */}
                <div className="rounded-sm border border-border bg-card p-6 shadow-xs flex flex-col items-center justify-center gap-3 text-center">
                  <motion.button
                    variants={favoritePulseVariants}
                    animate={isLiked ? 'liked' : 'unliked'}
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex h-12 w-12 items-center justify-center rounded-sm bg-secondary text-primary border border-primary/20 shadow-xs"
                  >
                    <Icon
                      name="favorite"
                      size="lg"
                      variant={isLiked ? 'solid' : 'stroke'}
                      className={isLiked ? 'text-rose-500' : 'text-muted-foreground'}
                    />
                  </motion.button>
                  <span className="text-xs font-semibold text-foreground">
                    {isLiked ? 'Saved to Favorites' : 'Click to Favorite'}
                  </span>
                </div>

                {/* Button Press Micro-interaction */}
                <div className="rounded-sm border border-border bg-card p-6 shadow-xs flex flex-col items-center justify-center gap-3 text-center">
                  <motion.div variants={buttonPressVariants} initial="initial" whileHover="hover" whileTap="tap">
                    <Button variant="default" size="lg" onClick={() => setIsModalOpen(true)}>
                      Trigger Modal Demo
                    </Button>
                  </motion.div>
                  <span className="text-xs text-muted-foreground">Press effect + scale response</span>
                </div>
              </div>
            </div>

            {/* Modal Dialog Demo */}
            <AnimatePresence>
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                  <motion.div
                    variants={modalVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Icon name="sparkles" className="text-primary" />
                        <h4 className="font-bold text-base">Animated Modal Entrance</h4>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="close" size="sm" />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Modal variants use spring snappy motion with scale, opacity, and backdrop blur. High responsiveness with WCAG focus state integration.
                    </p>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                        Close Modal
                      </Button>
                      <Button variant="default" size="sm" onClick={() => { toast.success('Demo Notification Triggered!'); setIsModalOpen(false); }}>
                        Confirm Action
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 4: SYSTEM STATES & TOAST NOTIFICATIONS */}
        {activeTab === 'states' && (
          <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="space-y-10"
          >
            {/* Toast System Controls */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">Sonner Toast System</h3>
              <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border bg-card p-6">
                <Button
                  variant="default"
                  onClick={() => toast.success('Place saved!')}
                >
                  Success Toast
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => toast.error('Failed to update bookmark')}
                >
                  Error Toast
                </Button>
                <Button
                  variant="accent"
                  onClick={() => toast.warning('Offline Mode Active')}
                >
                  Warning Toast
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toast.info('New Reviews Available')}
                >
                  Info Toast
                </Button>
              </div>
            </div>

            {/* Loading Components */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">Loading System & Progress Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-sm border border-border bg-card p-6 space-y-4">
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase">Card Skeleton State</h4>
                  <CardSkeleton />
                </div>

                <div className="rounded-sm border border-border bg-card p-6 space-y-6">
                  <h4 className="font-semibold text-xs text-muted-foreground uppercase">Progress Indicator & Spinner</h4>
                  <ProgressIndicator value={progress} label="Syncing Local Place Guides" />
                  <div className="flex items-center gap-3">
                    <Button size="xs" variant="outline" onClick={() => setProgress(Math.max(0, progress - 15))}>- 15%</Button>
                    <Button size="xs" variant="outline" onClick={() => setProgress(Math.min(100, progress + 15))}>+ 15%</Button>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <span className="text-xs text-muted-foreground">Standardized Primary Spinners</span>
                  </div>
                </div>
              </div>

              {/* Table Skeleton Loader */}
              <div className="rounded-sm border border-border bg-card p-6 space-y-3">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase">Table Loader Skeleton</h4>
                <TableLoader rows={3} />
              </div>
            </div>

            {/* Reusable Empty State */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">Empty State Component</h3>
              <EmptyState
                title="No Nearby Places Found"
                description="We could not find any tourist attractions matching your current filter criteria within a 50km radius."
                actionLabel="Reset Search Filters"
                onAction={() => toast.info('Filters Reset')}
              />
            </div>

            {/* Reusable Error State */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">Error State Component</h3>
              <ErrorState
                title="Unable to load map data"
                message="The tourism server did not respond in time. Please check your internet connection and try reloading."
                retryLabel="Reload Map Data"
                onRetry={() => toast.info('Retrying request...')}
              />
            </div>
          </motion.div>
        )}

      </main>
    </motion.div>
  )
}
