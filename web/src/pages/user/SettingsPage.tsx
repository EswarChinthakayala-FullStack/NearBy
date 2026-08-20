import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Settings02Icon,
  Sun01Icon,
  Moon02Icon,
  ComputerIcon,
  Location01Icon,
  Notification01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [browserNotifications, setBrowserNotifications] = useState(true)

  const handleSave = () => {
    localStorage.setItem('nearby_distance_unit', distanceUnit)
    toast.success('Application preferences saved successfully.')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Standardized Page Header */}
      <PageHeader
        title="Application Settings"
        description="Configure theme, distance units, notification preferences, and privacy controls."
        breadcrumbs={[{ label: 'Support' }, { label: 'Settings' }]}
      />
      <div>
        <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
          <HugeiconsIcon icon={Settings02Icon} className="size-5 text-teal-400" />
          <span>Account Preferences & Settings</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Customize theme, measurement units, location privacy, and notification triggers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 font-heading">
              <HugeiconsIcon icon={Sun01Icon} className="size-4 text-emerald-400" />
              <span>Appearance & Theme</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-sm border flex flex-col items-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <HugeiconsIcon icon={Sun01Icon} className="size-5" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-sm border flex flex-col items-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <HugeiconsIcon icon={Moon02Icon} className="size-5" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-sm border flex flex-col items-center gap-2 transition-all ${
                  theme === 'system'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <HugeiconsIcon icon={ComputerIcon} className="size-5" />
                <span>System</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Units & Measurement */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 font-heading">
              <HugeiconsIcon icon={Location01Icon} className="size-4 text-emerald-400" />
              <span>Distance Units</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDistanceUnit('km')}
                className={`p-3 rounded-sm border flex flex-col items-center gap-1 transition-all ${
                  distanceUnit === 'km'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-sm font-bold font-mono">Kilometers (km)</span>
                <span className="text-[10px] text-muted-foreground">Metric Standard</span>
              </button>

              <button
                type="button"
                onClick={() => setDistanceUnit('miles')}
                className={`p-3 rounded-sm border flex flex-col items-center gap-1 transition-all ${
                  distanceUnit === 'miles'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-sm font-bold font-mono">Miles (mi)</span>
                <span className="text-[10px] text-muted-foreground">Imperial Standard</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Preferences */}
        <Card className="border-border bg-card shadow-xs lg:col-span-2">
          <CardHeader className="p-5 pb-3 border-b border-border/40">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 font-heading">
              <HugeiconsIcon icon={Notification01Icon} className="size-4 text-emerald-400" />
              <span>Notification Preferences</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-sm border border-border/40 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-foreground">Email Digest & Alerts</Label>
                <p className="text-[11px] text-muted-foreground">Receive periodic digests of saved destinations and moderation status</p>
              </div>
              <Checkbox checked={emailAlerts} onCheckedChange={(val) => setEmailAlerts(!!val)} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-sm border border-border/40 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-xs font-bold text-foreground">Browser Push Notifications</Label>
                <p className="text-[11px] text-muted-foreground">Alert when new nearby spots are indexed around your location</p>
              </div>
              <Checkbox checked={browserNotifications} onCheckedChange={(val) => setBrowserNotifications(!!val)} />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} className="rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
                <span>Save Preferences</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
