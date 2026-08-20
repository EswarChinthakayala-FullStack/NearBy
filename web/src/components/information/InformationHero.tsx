import { Icon, type IconName } from '@/components/common/Icon'
import { LastUpdated } from './LastUpdated'

export interface InformationHeroProps {
  title: string
  description: string
  category: string
  iconName: IconName
  lastUpdatedDate?: string
  version?: string
  className?: string
}

export const InformationHero: React.FC<InformationHeroProps> = ({
  title,
  description,
  category,
  iconName,
  lastUpdatedDate,
  version,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-sm border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 p-8 sm:p-12 shadow-md backdrop-blur-xl space-y-6 ${className}`}
    >
      {/* Decorative Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative space-y-4 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20 font-mono">
            <Icon name={iconName} size="xs" />
            {category}
          </span>
          {lastUpdatedDate && <LastUpdated dateString={lastUpdatedDate} version={version} />}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-foreground leading-tight">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">
          {description}
        </p>
      </div>
    </div>
  )
}
