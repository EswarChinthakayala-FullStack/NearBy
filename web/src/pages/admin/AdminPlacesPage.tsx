import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminPlaceTable } from '@/components/admin/AdminPlaceTable'

export const AdminPlacesPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <AdminPlaceTable
        onEditPlace={(place) => navigate(`/admin/places/${place.uuid}/edit`)}
        onAddPlace={() => navigate('/admin/places/new')}
      />
    </div>
  )
}

export default AdminPlacesPage
