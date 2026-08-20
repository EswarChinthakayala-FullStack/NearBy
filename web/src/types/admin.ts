export interface AdminStats {
  total_places: number
  published_places: number
  draft_places: number
  total_categories: number
  total_reviews: number
  pending_reviews: number
  approved_reviews: number
  total_users: number
  active_users: number
  total_favorites: number
  total_images: number
  last_osm_sync?: string | null
}

export interface SyncLogRead {
  uuid: string
  job_type: 'osm_import' | 'wikipedia_enrichment' | 'image_fetch' | string
  status: 'completed' | 'in_progress' | 'failed' | string
  items_processed: number
  error_message?: string | null
  created_at?: string | null
}

export interface ActivityLogRead {
  uuid: string
  user_uuid?: string | null
  user_name?: string | null
  action: string
  details?: string | null
  ip_address?: string | null
  created_at?: string | null
}
