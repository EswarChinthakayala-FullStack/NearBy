import directionsService from './directions.service'
import placesService from './places.service'

/**
 * Enterprise Directions & Nearby API Service
 * Thin Axios wrappers around FastAPI /directions and /nearby endpoints
 */
export const directionsApi = {
  getDirections: directionsService.getDirections,
  getNearby: placesService.getNearbyPlaces,
}

export default directionsApi
