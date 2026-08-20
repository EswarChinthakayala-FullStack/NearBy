/**
 * Helper to resolve absolute or relative image URLs to valid displayable URLs.
 */
export const getImageUrl = (url?: string | null): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/uploads/')) return url
  if (url.startsWith('uploads/')) return `/${url}`
  return url
}
