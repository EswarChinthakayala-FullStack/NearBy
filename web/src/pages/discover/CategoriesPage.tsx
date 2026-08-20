import React from 'react'
import { useCategories } from '@/hooks/useCategory'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { CategoryGrid } from '@/components/discover/CategoryGrid'
import { Skeleton } from '@/components/ui/skeleton'

export const CategoriesPage: React.FC = () => {
  const { data: categories, isLoading } = useCategories()

  return (
    <PageContainer>
      {/* Standardized Page Header */}
      <PageHeader
        title="Explore Taxonomy Categories"
        description="Discover hand-curated destinations categorized by nature, history, heritage, adventure, food & culture."
        breadcrumbs={[{ label: 'Discover' }, { label: 'Categories' }]}
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-sm" />
          ))}
        </div>
      ) : (
        <CategoryGrid categories={categories || []} />
      )}
    </PageContainer>
  )
}

export default CategoriesPage
