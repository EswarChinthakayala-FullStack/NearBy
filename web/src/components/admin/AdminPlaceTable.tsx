import React, { useState, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Icon } from '@/components/common/Icon'
import AdminToolbar from './AdminToolbar'
import TableSkeleton from './TableSkeleton'
import EmptyAdminState from './EmptyAdminState'
import DeleteConfirmationDialog from './DeleteConfirmationDialog'
import { usePlaces } from '@/hooks/usePlaces'
import { useCategories } from '@/hooks/useCategories'
import {
  useBulkPublishPlaces,
  useBulkArchivePlaces,
  useBulkDeletePlaces,
  useTriggerPlaceWikipediaSync,
  useTriggerPlaceImagesSync,
} from '@/hooks/useAdmin'
import type { PlaceListItem } from '@/types/place'
import { getImageUrl } from '@/utils/imageUtils'

export interface AdminPlaceTableProps {
  onEditPlace?: (place: PlaceListItem) => void
  onAddPlace?: () => void
  className?: string
}

export const AdminPlaceTable: React.FC<AdminPlaceTableProps> = ({
  onEditPlace,
  onAddPlace,
  className = '',
}) => {
  const [page, setPage] = useState(1)
  const pageSize = 15

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [selectedUuids, setSelectedUuids] = useState<string[]>([])
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Fetch categories for toolbar dropdown
  const { data: categories = [] } = useCategories()

  // Fetch paginated places from backend
  const filterParams = useMemo(() => {
    return {
      page,
      page_size: pageSize,
      query: searchQuery.trim() || undefined,
      category_id: selectedCategory !== 'all' ? parseInt(selectedCategory, 10) : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }
  }, [page, pageSize, searchQuery, selectedCategory, selectedStatus])

  const { data: response, isLoading, isError, refetch } = usePlaces(filterParams)

  const places = response?.data || []
  const pagination = response?.pagination

  // Mutations
  const bulkPublishMutation = useBulkPublishPlaces()
  const bulkArchiveMutation = useBulkArchivePlaces()
  const bulkDeleteMutation = useBulkDeletePlaces()
  const syncWikiMutation = useTriggerPlaceWikipediaSync()
  const syncImagesMutation = useTriggerPlaceImagesSync()

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUuids(places.map((p) => p.uuid))
    } else {
      setSelectedUuids([])
    }
  }

  const handleSelectRow = (uuid: string, checked: boolean) => {
    if (checked) {
      setSelectedUuids((prev) => [...prev, uuid])
    } else {
      setSelectedUuids((prev) => prev.filter((id) => id !== uuid))
    }
  }

  const allSelectedOnPage =
    places.length > 0 && places.every((p) => selectedUuids.includes(p.uuid))

  // Bulk action triggers
  const handleBulkPublish = () => {
    if (!selectedUuids.length) return
    bulkPublishMutation.mutate(selectedUuids, {
      onSuccess: () => setSelectedUuids([]),
    })
  }

  const handleBulkArchive = () => {
    if (!selectedUuids.length) return
    bulkArchiveMutation.mutate(selectedUuids, {
      onSuccess: () => setSelectedUuids([]),
    })
  }

  const handleConfirmDelete = () => {
    if (deletingUuid) {
      bulkDeleteMutation.mutate([deletingUuid], {
        onSuccess: () => {
          setDeletingUuid(null)
          setSelectedUuids((prev) => prev.filter((id) => id !== deletingUuid))
        },
      })
    } else if (isBulkDeleting && selectedUuids.length > 0) {
      bulkDeleteMutation.mutate(selectedUuids, {
        onSuccess: () => {
          setIsBulkDeleting(false)
          setSelectedUuids([])
        },
      })
    }
  }

  const isBulkProcessing =
    bulkPublishMutation.isPending ||
    bulkArchiveMutation.isPending ||
    bulkDeleteMutation.isPending

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search & Filter Toolbar */}
      <AdminToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setPage(1)
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(c) => {
          setSelectedCategory(c)
          setPage(1)
        }}
        categories={categories}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s)
          setPage(1)
        }}
        selectedCount={selectedUuids.length}
        onBulkPublish={handleBulkPublish}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={() => setIsBulkDeleting(true)}
        isBulkProcessing={isBulkProcessing}
      />

      {/* Table Loading State */}
      {isLoading && <TableSkeleton rows={8} cols={7} />}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="p-8 rounded-sm border border-destructive/30 bg-destructive/5 text-center space-y-3">
          <Icon name="error" size="lg" className="text-destructive mx-auto" />
          <h5 className="text-sm font-bold text-foreground">Unable to load places</h5>
          <p className="text-xs text-muted-foreground">
            We encountered a network error retrieving tourist places from the backend database.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-sm text-xs font-semibold">
            <Icon name="refresh" size="xs" className="mr-1.5" />
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && places.length === 0 && (
        <EmptyAdminState
          iconName="places"
          title="No Places Found"
          description="No tourist places match your active search term or filter criteria."
          actionLabel={onAddPlace ? 'Add New Place' : undefined}
          onAction={onAddPlace}
        />
      )}

      {/* Places Data Table */}
      {!isLoading && !isError && places.length > 0 && (
        <div className="rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border/60">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox
                    checked={allSelectedOnPage}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all on current page"
                  />
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Place</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider hidden md:table-cell">Category</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Location</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Rating</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {places.map((place) => {
                const isSelected = selectedUuids.includes(place.uuid)

                return (
                  <TableRow
                    key={place.uuid}
                    className={`hover:bg-muted/40 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Select Row Checkbox */}
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(place.uuid, !!checked)}
                        aria-label={`Select ${place.name}`}
                      />
                    </TableCell>

                    {/* Cover Image & Name */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm overflow-hidden bg-muted shrink-0 border border-border/60">
                          {place.cover_image_url ? (
                            <img src={getImageUrl(place.cover_image_url)} alt={place.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Icon name="places" size="xs" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h6 className="text-xs font-bold text-foreground truncate max-w-[200px]">
                            {place.name}
                          </h6>
                          <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[180px]">
                            {place.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="hidden md:table-cell text-xs font-medium">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {place.category?.name || 'Uncategorized'}
                      </Badge>
                    </TableCell>

                    {/* City / State */}
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-medium">
                      {place.city}
                    </TableCell>

                    {/* Rating & Favorites */}
                    <TableCell className="text-xs font-mono font-bold">
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <span>★ {place.avg_rating.toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          ({place.total_reviews})
                        </span>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge
                        variant={
                          place.status === 'published'
                            ? 'default'
                            : place.status === 'draft'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 ${
                          place.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                            : place.status === 'draft'
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {place.status}
                      </Badge>
                    </TableCell>

                    {/* Actions Row */}
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit Button */}
                        {onEditPlace && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditPlace(place)}
                            className="h-8 px-2 rounded-sm text-muted-foreground hover:text-foreground text-xs"
                          >
                            <Icon name="edit" size="xs" />
                          </Button>
                        )}

                        {/* Wikipedia Sync Trigger */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => syncWikiMutation.mutate(place.uuid)}
                          disabled={syncWikiMutation.isPending}
                          title="Trigger Wikipedia Content Sync"
                          className="h-8 px-2 rounded-sm text-muted-foreground hover:text-blue-500 text-xs"
                        >
                          <Icon name="sparkles" size="xs" />
                        </Button>

                        {/* Image Sync Trigger */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => syncImagesMutation.mutate(place.uuid)}
                          disabled={syncImagesMutation.isPending}
                          title="Trigger Image Acquisition Pipeline"
                          className="h-8 px-2 rounded-sm text-muted-foreground hover:text-cyan-500 text-xs"
                        >
                          <Icon name="gallery" size="xs" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingUuid(place.uuid)}
                          className="h-8 px-2 rounded-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 text-xs"
                        >
                          <Icon name="delete" size="xs" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Pagination Controls Footer */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border/60 bg-muted/30 text-xs">
              <span className="text-muted-foreground font-medium">
                Showing page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
                <span className="font-semibold text-foreground">{pagination.total_pages}</span> ({pagination.total_items} total places)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-sm h-8 text-xs font-semibold"
                >
                  <Icon name="arrow-left" size="xs" className="mr-1" />
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
                  <Icon name="arrow-right" size="xs" className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        open={!!deletingUuid || isBulkDeleting}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingUuid(null)
            setIsBulkDeleting(false)
          }
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={bulkDeleteMutation.isPending}
        title={deletingUuid ? 'Delete Place' : `Delete ${selectedUuids.length} Selected Places`}
        description="Are you sure you want to permanently delete this record? This action will update all category metrics and favorite bookmarks."
      />
    </div>
  )
}

export default AdminPlaceTable
