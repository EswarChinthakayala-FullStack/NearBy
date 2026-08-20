import React, { useState, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Icon, type IconName } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TableRowSkeleton } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import type { Category } from '@/types/category'

import DeleteConfirmationDialog from '@/components/admin/DeleteConfirmationDialog'

const CATEGORY_ICON_MAP: Record<string, { icon: IconName; color: string }> = {
  temple: { icon: 'building', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  beach: { icon: 'weather', color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' },
  museum: { icon: 'building', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30' },
  park: { icon: 'location', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  historical: { icon: 'shield', color: 'bg-rose-500/10 text-rose-500 border-rose-500/30' },
  nature: { icon: 'weather', color: 'bg-teal-500/10 text-teal-500 border-teal-500/30' },
  wildlife: { icon: 'location', color: 'bg-amber-600/10 text-amber-600 border-amber-600/30' },
  shopping: { icon: 'categories', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  waterfall: { icon: 'weather', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  viewpoint: { icon: 'location', color: 'bg-emerald-600/10 text-emerald-600 border-emerald-600/30' },
}

const getCategoryBadge = (name: string) => {
  const norm = (name || '').toLowerCase()
  for (const key in CATEGORY_ICON_MAP) {
    if (norm.includes(key)) {
      return CATEGORY_ICON_MAP[key]
    }
  }
  return { icon: 'categories' as IconName, color: 'bg-primary/10 text-primary border-primary/30' }
}

export const CategoriesPage: React.FC = () => {
  const { data: categories = [], isLoading, isError, refetch } = useCategories()
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const handleNameChange = (val: string) => {
    setCatName(val)
    if (!editingCategory) {
      const slugified = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
      setCatSlug(slugified)
    }
  }

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatSlug(cat.slug)
    setCatDesc(cat.description || '')
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setCatName('')
    setCatSlug('')
    setCatDesc('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName) return

    if (editingCategory && editingCategory.id) {
      updateCategoryMutation.mutate(
        {
          id: Number(editingCategory.id),
          data: { name: catName, slug: catSlug, description: catDesc },
        },
        {
          onSuccess: () => {
            handleCancelEdit()
          },
        }
      )
    } else {
      createCategoryMutation.mutate(
        { name: catName, slug: catSlug, description: catDesc },
        {
          onSuccess: () => {
            handleCancelEdit()
          },
        }
      )
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || !deleteTarget.id) return
    deleteCategoryMutation.mutate(Number(deleteTarget.id), {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories
    const term = searchTerm.toLowerCase()
    return categories.filter(
      (c) => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term) || (c.description || '').toLowerCase().includes(term)
    )
  }, [categories, searchTerm])

  const isSaving = createCategoryMutation.isPending || updateCategoryMutation.isPending

  return (
    <div className="space-y-6">
      {/* Standardized Page Header */}
      <PageHeader
        title="Categories Taxonomy"
        description="Define and organize regional place classification taxonomy, icons, and sub-types."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Categories' }]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono px-3 py-1 bg-card/60">
              Total Categories: <span className="font-bold text-foreground ml-1">{categories.length}</span>
            </Badge>
          </div>
        }
      />

      {/* Main Grid: Form on Left, Table on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Category Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-sm border border-border/70 bg-card/70 backdrop-blur-md p-5 space-y-4 shadow-xs sticky top-4"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Icon name={editingCategory ? 'edit' : 'categories'} size="xs" className="text-primary" />
              <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
            </h3>

            {editingCategory && (
              <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit} className="h-7 px-2 text-xs">
                Cancel
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Category Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={catName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Heritage Monuments"
                className="rounded-sm border-border/70 bg-background/80 text-xs font-semibold h-9"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">URL Slug</label>
              <Input
                type="text"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                placeholder="heritage-monuments"
                className="rounded-sm border-border/70 bg-background/80 text-xs font-mono h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Description</label>
              <Textarea
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Brief category description..."
                rows={3}
                className="rounded-sm border-border/70 bg-background/80 text-xs leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="submit"
              size="sm"
              className="rounded-sm gap-2 font-semibold text-xs h-9 w-full bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={isSaving}
            >
              <Icon name="check" size="xs" />
              <span>
                {isSaving ? (editingCategory ? 'Updating...' : 'Creating...') : editingCategory ? 'Update Category' : 'Create Category'}
              </span>
            </Button>
          </div>
        </form>

        {/* Categories Table Container */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md">
            <div className="relative flex-1">
              <Icon name="search" size="xs" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories by name, slug, or description..."
                className="pl-8 h-9 text-xs rounded-sm border-border/60 bg-background/50"
              />
            </div>
          </div>

          {/* Table Card */}
          <div className="rounded-sm border border-border/70 bg-card/60 backdrop-blur-md overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <EmptyState
                iconName="error"
                title="Failed to Load Categories"
                description="Unable to retrieve category taxonomy data."
                actionLabel="Retry"
                onAction={() => refetch()}
              />
            ) : filteredCategories.length === 0 ? (
              <EmptyState
                iconName="categories"
                title="No Categories Found"
                description={searchTerm ? `No categories match query "${searchTerm}".` : 'No categories created yet.'}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-4">Category Taxonomy</th>
                      <th className="p-3.5">URL Slug</th>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredCategories.map((cat: Category) => {
                      const badgeCfg = getCategoryBadge(cat.name)
                      return (
                        <tr key={cat.id} className="hover:bg-muted/30 transition-colors group">
                          {/* Name & Icon */}
                          <td className="p-3.5 pl-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-sm border flex items-center justify-center shrink-0 ${badgeCfg.color}`}>
                                <Icon name={badgeCfg.icon} size="xs" />
                              </div>
                              <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors">
                                {cat.name}
                              </span>
                            </div>
                          </td>

                          {/* Slug */}
                          <td className="p-3.5 font-mono">
                            <Badge variant="outline" className="text-[11px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                              {cat.slug}
                            </Badge>
                          </td>

                          {/* Description */}
                          <td className="p-3.5 text-muted-foreground max-w-[280px] leading-relaxed">
                            {cat.description || '—'}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEdit(cat)}
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                                title="Edit Category"
                              >
                                <Icon name="edit" size="xs" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget(cat)}
                                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                                title="Delete Category"
                              >
                                <Icon name="delete" size="xs" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Alert Dialog */}
      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget ? `Delete Category "${deleteTarget.name}"?` : 'Confirm Deletion'}
        description="Are you sure you want to proceed with this category deletion? Places assigned to this taxonomy tag may lose their category classification."
        onConfirm={handleConfirmDelete}
        isDeleting={deleteCategoryMutation.isPending}
      />
    </div>
  )
}

export default CategoriesPage
