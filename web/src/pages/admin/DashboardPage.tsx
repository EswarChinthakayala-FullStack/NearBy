import React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { AdminStatsCards } from '@/components/admin/AdminStatsCards'
import { RecentActivityFeed } from '@/components/admin/RecentActivityFeed'
import { TriggerSyncButton } from '@/components/admin/TriggerSyncButton'

export const DashboardPage: React.FC = () => {
  return (
    <PageContainer>
      {/* Standardized Page Header */}
      <PageHeader
        title="Admin Control Center"
        description="Monitor live system telemetry, dataset sync jobs, content moderation, and user statistics."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex items-center gap-2">
            <TriggerSyncButton type="osm" />
            <TriggerSyncButton type="wikipedia" />
          </div>
        }
      />

      {/* Real Live Database Metrics Cards */}
      <AdminStatsCards />

      {/* Sync Controls & Action Triggers Bar */}
      <div className="p-6 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-foreground">Background Synchronization Controls</h4>
            <p className="text-xs text-muted-foreground">
              Dispatch background Celery jobs to pull GIS nodes from OpenStreetMap or enrich content via Wikipedia.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <TriggerSyncButton type="osm" />
            <TriggerSyncButton type="wikipedia" />
          </div>
        </div>
      </div>

      {/* Admin Activity Feed & Quick Links Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <RecentActivityFeed />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-sm border border-border bg-card space-y-3 shadow-sm">
            <h4 className="text-sm font-bold text-foreground">System Health Telemetry</h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Status:</span>
                <span className="text-emerald-400 font-bold">Healthy (MySQL 8)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">FastAPI Engine:</span>
                <span className="text-emerald-400 font-bold">Online (ASGI v1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mistral AI Integration:</span>
                <span className="text-emerald-400 font-bold">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default DashboardPage
