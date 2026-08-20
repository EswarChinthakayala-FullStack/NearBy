import favoritesService from './favorites.service'

/**
 * Enterprise Favorites API Service
 * Thin Axios wrappers around FastAPI /favorites endpoints
 */
export const favoritesApi = {
  list: favoritesService.getFavorites,
  toggle: favoritesService.toggleFavorite,
  remove: favoritesService.removeFavorite,
}

export default favoritesApi
