import { Icon, type IconName } from '@/components/common/Icon'

export interface PolicyCardProps {
  sectionNumber: string
  title: string
  description: string
  iconName?: IconName
  children?: React.ReactNode
  id?: string
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  sectionNumber,
  title,
  description,
  iconName = 'shield',
  children,
  id,
}) => {
  return (
    <article
      id={id}
      className="group relative rounded-sm border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 p-6 shadow-xs hover:border-primary/40 backdrop-blur-md transition-all space-y-4 scroll-mt-24"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-7 px-2.5 items-center justify-center rounded-sm bg-primary/10 border border-primary/20 font-mono text-xs font-bold text-primary">
            Section {sectionNumber}
          </span>
          <h3 className="text-lg font-bold font-heading text-foreground tracking-tight">{title}</h3>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
          <Icon name={iconName} size="sm" />
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

      {children && <div className="pt-2 border-t border-border/60 text-xs text-foreground space-y-3">{children}</div>}
    </article>
  )
}
