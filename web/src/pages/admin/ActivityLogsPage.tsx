import React from 'react'
import { RecentActivityFeed } from '@/components/admin/RecentActivityFeed'

export const ActivityLogsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <RecentActivityFeed />
    </div>
  )
}

export default ActivityLogsPage
