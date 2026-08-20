import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Icon } from '@/components/common/Icon'
import { toast } from 'sonner'

export interface DayTiming {
  day: string
  openTime: string
  closeTime: string
  isClosed: boolean
}

export interface TimingsEditorProps {
  value?: string
  onChange: (formattedTimings: string) => void
  disabled?: boolean
  className?: string
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const DEFAULT_SCHEDULE: DayTiming[] = DAYS_OF_WEEK.map((day) => ({
  day,
  openTime: '09:00',
  closeTime: '18:00',
  isClosed: false,
}))

export const TimingsEditor: React.FC<TimingsEditorProps> = ({
  value = '',
  onChange,
  disabled = false,
  className = '',
}) => {
  const [schedule, setSchedule] = useState<DayTiming[]>(DEFAULT_SCHEDULE)
  const [prevValue, setPrevValue] = useState(value)

  // Derived state sync during render
  if (value !== prevValue) {
    setPrevValue(value)
    if (value && value.trim()) {
      setSchedule((prev) =>
        prev.map((item) => ({ ...item, isClosed: value.toLowerCase().includes('closed') }))
      )
    }
  }

  const formatScheduleToString = (items: DayTiming[]): string => {
    const active = items.filter((i) => !i.isClosed)
    if (active.length === 0) return 'Closed on all days'

    const allSame = items.every(
      (i) =>
        i.isClosed === items[0].isClosed &&
        i.openTime === items[0].openTime &&
        i.closeTime === items[0].closeTime
    )

    if (allSame && !items[0].isClosed) {
      return `Open Daily: ${items[0].openTime} - ${items[0].closeTime}`
    }

    return items
      .map((i) =>
        i.isClosed ? `${i.day}: Closed` : `${i.day}: ${i.openTime} - ${i.closeTime}`
      )
      .join(' | ')
  }

  const handleTimingChange = (index: number, key: keyof DayTiming, val: string | boolean) => {
    const updated = [...schedule]
    updated[index] = { ...updated[index], [key]: val }
    setSchedule(updated)
    onChange(formatScheduleToString(updated))
  }

  const handleCopyFirstDayToAll = () => {
    const first = schedule[0]
    const updated = schedule.map((item) => ({
      ...item,
      openTime: first.openTime,
      closeTime: first.closeTime,
      isClosed: first.isClosed,
    }))
    setSchedule(updated)
    onChange(formatScheduleToString(updated))
    toast.success('Applied Monday timings to all 7 days')
  }

  return (
    <div className={`p-5 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h5 className="text-sm font-bold text-foreground">Operating Hours & Timings</h5>
          <p className="text-xs text-muted-foreground">Configure weekly opening hours for visitors</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyFirstDayToAll}
          disabled={disabled}
          className="rounded-sm h-8 px-2.5 text-xs font-semibold"
        >
          <Icon name="sparkles" size="xs" className="mr-1.5" />
          Copy Mon to All
        </Button>
      </div>

      <div className="space-y-3">
        {schedule.map((item, idx) => (
          <div
            key={item.day}
            className="flex items-center justify-between gap-3 p-2.5 rounded-sm border border-border/50 bg-background/50 text-xs"
          >
            <span className="w-24 font-bold text-foreground">{item.day}</span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={!item.isClosed}
                  onCheckedChange={(checked) => handleTimingChange(idx, 'isClosed', !checked)}
                  disabled={disabled}
                  aria-label={`Toggle open state for ${item.day}`}
                />
                <span className={item.isClosed ? 'text-muted-foreground font-mono' : 'text-emerald-500 font-bold'}>
                  {item.isClosed ? 'Closed' : 'Open'}
                </span>
              </div>

              {!item.isClosed && (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="time"
                    value={item.openTime}
                    onChange={(e) => handleTimingChange(idx, 'openTime', e.target.value)}
                    disabled={disabled}
                    className="w-24 h-7 text-xs font-mono rounded-sm border-border/70 bg-background"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={item.closeTime}
                    onChange={(e) => handleTimingChange(idx, 'closeTime', e.target.value)}
                    disabled={disabled}
                    className="w-24 h-7 text-xs font-mono rounded-sm border-border/70 bg-background"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimingsEditor
