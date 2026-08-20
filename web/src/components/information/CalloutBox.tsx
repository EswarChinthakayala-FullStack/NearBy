import { Icon, type IconName } from '@/components/common/Icon'

export interface CalloutBoxProps {
  type?: 'info' | 'tip' | 'warning' | 'security' | 'success'
  title: string
  children: React.ReactNode
  iconName?: IconName
  className?: string
}

export const CalloutBox: React.FC<CalloutBoxProps> = ({
  type = 'info',
  title,
  children,
  iconName,
  className = '',
}) => {
  const styles = {
    info: {
      border: 'border-teal-500/40 bg-teal-500/10 text-foreground',
      iconColor: 'text-teal-400',
      defaultIcon: 'info' as IconName,
    },
    tip: {
      border: 'border-amber-500/40 bg-amber-500/10 text-foreground',
      iconColor: 'text-amber-400',
      defaultIcon: 'sparkles' as IconName,
    },
    warning: {
      border: 'border-rose-500/40 bg-rose-500/10 text-foreground',
      iconColor: 'text-rose-400',
      defaultIcon: 'warning' as IconName,
    },
    security: {
      border: 'border-sky-500/40 bg-sky-500/10 text-foreground',
      iconColor: 'text-sky-400',
      defaultIcon: 'shield' as IconName,
    },
    success: {
      border: 'border-emerald-500/40 bg-emerald-500/10 text-foreground',
      iconColor: 'text-emerald-400',
      defaultIcon: 'success' as IconName,
    },
  }

  const currentStyle = styles[type]
  const icon = iconName || currentStyle.defaultIcon

  return (
    <div
      className={`relative my-6 rounded-sm border p-4 sm:p-5 backdrop-blur-md transition-all ${currentStyle.border} ${className}`}
      role="note"
    >
      <div className="flex items-start gap-3.5">
        <div className={`mt-0.5 shrink-0 ${currentStyle.iconColor}`}>
          <Icon name={icon} size="md" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm font-bold tracking-tight text-foreground font-heading">{title}</h4>
          <div className="text-xs text-muted-foreground leading-relaxed space-y-2">{children}</div>
        </div>
      </div>
    </div>
  )
}
