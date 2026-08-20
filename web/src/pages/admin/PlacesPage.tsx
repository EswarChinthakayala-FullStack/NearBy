import React, { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/common/Icon'
import { AdminPlaceTable } from '@/components/admin/AdminPlaceTable'
import { AdminPlaceForm } from '@/components/admin/AdminPlaceForm'
import type { Place, PlaceListItem } from '@/types/place'

export const PlacesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)

  const handleCreateNew = () => {
    setEditingPlace(null)
    setIsFormOpen(true)
  }

  const handleEdit = (place: PlaceListItem | Place) => {
    setEditingPlace(place as Place)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingPlace(null)
  }

  return (
    <PageContainer>
      {/* Standardized Page Header */}
      <PageHeader
        title="Places Index & CRUD Management"
        description="Manage tourist destinations, create new listings, edit GIS coordinates, and update taxonomy categories."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Places Management' }]}
        actions={
          <Button
            onClick={handleCreateNew}
            className="rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-11 px-5 text-xs gap-2 shadow-sm"
          >
            <Icon name="edit" size="xs" />
            <span>Create New Destination</span>
          </Button>
        }
      />

      {isFormOpen ? (
        <AdminPlaceForm
          existingPlace={editingPlace || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <AdminPlaceTable onEditPlace={handleEdit} onAddPlace={handleCreateNew} />
      )}
    </PageContainer>
  )
}

export default PlacesPage
