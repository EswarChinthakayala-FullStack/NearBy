import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'

export interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: IconSvgElement
  trend?: 'up' | 'down' | 'neutral'
  percentage?: number
  progressValue?: number
  loading?: boolean
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  percentage,
  progressValue,
  loading = false,
  className = '',
}) => {
  if (loading) {
    return <Skeleton className="h-36 w-full rounded-sm" />
  }

  return (
    <Card className={`rounded-sm border border-border bg-card shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-primary/40 transition-all duration-300 h-full flex flex-col justify-between ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <HugeiconsIcon icon={icon} className="size-5" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-heading text-foreground tracking-tight">{value}</div>
          {percentage !== undefined && (
            <Badge
              variant="outline"
              className={`text-[10px] font-mono font-bold rounded-lg ${
                trend === 'up'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : trend === 'down'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {percentage}%
            </Badge>
          )}
        </div>

        {progressValue !== undefined && <Progress value={progressValue} className="h-1.5 bg-muted rounded-full" />}

        {description && <p className="text-[11px] text-muted-foreground font-mono">{description}</p>}
      </CardContent>
    </Card>
  )
}

export default StatCard
