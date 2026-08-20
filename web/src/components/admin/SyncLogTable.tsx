import React, { useState } from 'react'
import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/common/Icon'
import TableSkeleton from './TableSkeleton'
import EmptyAdminState from './EmptyAdminState'
import { useSyncLogs } from '@/hooks/useAdmin'
import type { SyncLogItem } from '@/services/api/admin.service'

export interface SyncLogTableProps {
  className?: string
}

export const SyncLogTable: React.FC<SyncLogTableProps> = ({ className = '' }) => {
  const [page, setPage] = useState(1)
  const pageSize = 15

  const { data: response, isLoading, isError, refetch } = useSyncLogs(page, pageSize)

  const logs: SyncLogItem[] = response?.data || []
  const pagination = response?.pagination

  if (isLoading) {
    return <TableSkeleton rows={6} cols={7} />
  }

  if (isError) {
    return (
      <div className="p-8 rounded-sm border border-destructive/30 bg-destructive/5 text-center space-y-3">
        <Icon name="error" size="lg" className="text-destructive mx-auto" />
        <h5 className="text-sm font-bold text-foreground">Unable to load synchronization logs</h5>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-sm text-xs font-semibold">
          <Icon name="refresh" size="xs" className="mr-1.5" />
          Retry
        </Button>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <EmptyAdminState
        iconName="refresh"
        title="No Sync History Logs"
        description="Synchronization jobs dispatches for OpenStreetMap, Wikipedia, and Bing media pipelines will be recorded here."
      />
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border/60">
            <TableRow>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Log ID</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Sync Type</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Region</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-center">Fetched / Imported</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Started Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              let startedAgo = 'N/A'
              if (log.started_at) {
                try {
                  const parsed = parseISO(log.started_at)
                  if (isValid(parsed)) {
                    startedAgo = formatDistanceToNow(parsed, { addSuffix: true })
                  }
                } catch {
                  startedAgo = 'N/A'
                }
              }

              const statusLower = (log.status || '').toLowerCase()

              return (
                <TableRow key={log.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="text-xs font-mono font-bold text-foreground">
                    #{log.id}
                  </TableCell>

                  <TableCell className="text-xs font-semibold">
                    <Badge variant="outline" className="text-[10px] font-mono uppercase bg-primary/10 text-primary border-primary/30">
                      {log.sync_type || 'OSM Import'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {log.region || 'Delhi'}
                  </TableCell>

                  <TableCell>
                    {statusLower === 'completed' || statusLower === 'success' ? (
                      <Badge variant="outline" className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1.5 inline-flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Completed</span>
                      </Badge>
                    ) : statusLower === 'in_progress' || statusLower === 'running' ? (
                      <Badge variant="outline" className="text-[10px] font-mono uppercase px-2 py-0.5 bg-blue-500/10 text-blue-400 border-blue-500/30 gap-1.5 inline-flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <span>In Progress</span>
                      </Badge>
                    ) : statusLower === 'failed' ? (
                      <Badge variant="outline" className="text-[10px] font-mono uppercase px-2 py-0.5 bg-rose-500/10 text-rose-400 border-rose-500/30 gap-1.5 inline-flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        <span>Failed</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-mono uppercase px-2 py-0.5 bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1.5 inline-flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>{log.status || 'Pending'}</span>
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-xs font-mono font-bold text-center">
                    <span className="text-emerald-500">{log.total_imported}</span> /{' '}
                    <span className="text-muted-foreground">{log.total_fetched}</span>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {startedAgo}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/60 bg-muted/30 text-xs">
            <span className="text-muted-foreground font-medium">
              Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
              <span className="font-semibold text-foreground">{pagination.total_pages}</span>
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-sm h-8 text-xs font-semibold"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-sm h-8 text-xs font-semibold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SyncLogTable
