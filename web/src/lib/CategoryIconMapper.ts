import type { IconName } from '@/components/common/Icon'

/**
 * Category Name to Icon Name Mapper
 * Maps backend category names or slugs to valid IconName strings with default fallback
 */
const CATEGORY_MAP: Record<string, IconName> = {
  // Common Tourism Categories
  monuments: 'building',
  monument: 'building',
  historical: 'building',
  heritage: 'building',
  architecture: 'building',
  nature: 'weather',
  parks: 'weather',
  park: 'weather',
  gardens: 'weather',
  wildlife: 'weather',
  beaches: 'sun',
  beach: 'sun',
  coastal: 'sun',
  museums: 'grid',
  museum: 'grid',
  art: 'sparkles',
  culture: 'sparkles',
  cultural: 'sparkles',
  food: 'ratings',
  dining: 'ratings',
  restaurants: 'ratings',
  cuisine: 'ratings',
  shopping: 'bookmark',
  markets: 'bookmark',
  bazaars: 'bookmark',
  religious: 'star',
  temples: 'star',
  temple: 'star',
  churches: 'star',
  adventure: 'route',
  hiking: 'route',
  trekking: 'route',
  sports: 'route',
  nightlife: 'moon',
  entertainment: 'moon',
}

export function getCategoryIcon(categoryNameOrSlug?: string | null): IconName {
  if (!categoryNameOrSlug) return 'categories'

  const normalized = categoryNameOrSlug.trim().toLowerCase()
  return CATEGORY_MAP[normalized] || 'categories'
}

export default getCategoryIcon
