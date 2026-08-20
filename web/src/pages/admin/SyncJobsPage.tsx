import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SyncLogTable } from '@/components/admin/SyncLogTable'
import { TriggerSyncButton } from '@/components/admin/TriggerSyncButton'

export const SyncJobsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Standardized Page Header */}
      <PageHeader
        title="Sync Jobs & Pipelines"
        description="Dispatch automated background workers for OpenStreetMap spatial data import or Wikipedia content enrichment."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Sync Jobs' }]}
        actions={
          <div className="flex items-center gap-2">
            <TriggerSyncButton type="osm" />
            <TriggerSyncButton type="wikipedia" />
          </div>
        }
      />

      <SyncLogTable />
    </div>
  )
}

export default SyncJobsPage
