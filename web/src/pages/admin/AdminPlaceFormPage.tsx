import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AdminPlaceForm } from '@/components/admin/AdminPlaceForm'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminPlace } from '@/hooks/useAdminPlaces'

export const AdminPlaceFormPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const { data: place, isLoading } = useAdminPlace(uuid)

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="p-8 rounded-sm border border-border bg-card space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-8 w-1/3 rounded-sm" />
          <Skeleton className="h-12 w-full rounded-sm" />
          <Skeleton className="h-32 w-full rounded-sm" />
          <Skeleton className="h-12 w-2/3 rounded-sm" />
        </div>
      ) : (
        <AdminPlaceForm
          existingPlace={place}
          onSuccess={() => navigate('/admin/places')}
          onCancel={() => navigate('/admin/places')}
        />
      )}
    </div>
  )
}

export default AdminPlaceFormPage
