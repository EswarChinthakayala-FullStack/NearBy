export interface CategoryRead {
  uuid: string
  id?: string | number
  name: string
  slug: string
  description?: string | null
  icon_name?: string | null
  places_count?: number
  created_at?: string | null
}

export type Category = CategoryRead
export type CategoryCreateParams = Partial<CategoryRead> & { name: string }
export type CategoryUpdateParams = Partial<CategoryRead>
