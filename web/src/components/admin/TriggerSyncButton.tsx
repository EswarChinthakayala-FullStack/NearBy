import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/common/Icon'
import { useTriggerOsmSync, useTriggerWikipediaSync } from '@/hooks/useSyncActions'
import { toast } from 'sonner'

export interface TriggerSyncButtonProps {
  type?: 'osm' | 'wikipedia'
  className?: string
}

export const TriggerSyncButton: React.FC<TriggerSyncButtonProps> = ({
  type = 'osm',
  className = '',
}) => {
  const [open, setOpen] = useState(false)
  const [targetCity, setTargetCity] = useState('Delhi')

  const triggerOsm = useTriggerOsmSync()
  const triggerWiki = useTriggerWikipediaSync()

  const isPending = triggerOsm.isPending || triggerWiki.isPending

  const handleTrigger = () => {
    if (!navigator.onLine) {
      toast.error('You are offline. Reconnect to dispatch sync operations.')
      return
    }

    if (type === 'osm') {
      if (!targetCity.trim()) {
        toast.error('Please enter a target city name')
        return
      }
      triggerOsm.mutate(targetCity.trim(), {
        onSuccess: () => setOpen(false),
      })
    } else {
      triggerWiki.mutate(undefined, {
        onSuccess: () => setOpen(false),
      })
    }
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className={`h-9 text-xs px-4 rounded-sm font-semibold gap-2 shadow-sm transition-all ${
          type === 'osm' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
        } ${className}`}
      >
        <Icon name={type === 'osm' ? 'refresh' : 'sparkles'} size="xs" />
        <span>{type === 'osm' ? 'Import OSM Places' : 'Sync Wikipedia Content'}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-sm border border-border/80 bg-card p-6 shadow-2xl backdrop-blur-2xl space-y-4">
          <DialogHeader className="space-y-3">
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center border shadow-xs ${
              type === 'osm'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}>
              <Icon name={type === 'osm' ? 'refresh' : 'sparkles'} size="md" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground leading-tight">
              {type === 'osm' ? 'Trigger OpenStreetMap Synchronization' : 'Trigger Wikipedia Content Sync'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {type === 'osm'
                ? 'Dispatch a Celery background worker job to query OpenStreetMap Overpass API for tourism nodes and import them into the database.'
                : 'Dispatch a background job to enrich places lacking historical summaries with Wikipedia content.'}
            </DialogDescription>
          </DialogHeader>

          {type === 'osm' && (
            <div className="space-y-2 py-1">
              <Label htmlFor="sync-target-city" className="text-xs font-bold text-foreground">
                Target City / Region Name
              </Label>
              <Input
                id="sync-target-city"
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                placeholder="e.g. Delhi, Mumbai, Jaipur"
                className="h-10 text-xs rounded-sm border-border/80 bg-background/80 focus:bg-background px-3.5 shadow-xs font-medium text-foreground"
              />
            </div>
          )}

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="h-9 px-4 rounded-sm text-xs font-semibold border-border/80 hover:bg-muted transition-all shadow-xs"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleTrigger}
              disabled={isPending}
              className={`h-9 px-5 rounded-sm text-xs font-bold text-white shadow-md transition-all gap-2 ${
                type === 'osm'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  <Icon name="loading" size="xs" spinning />
                  Dispatching Job...
                </span>
              ) : (
                <>
                  <Icon name={type === 'osm' ? 'refresh' : 'sparkles'} size="xs" />
                  <span>Dispatch Task</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TriggerSyncButton
