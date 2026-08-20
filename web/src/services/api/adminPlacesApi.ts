import placesService from './places.service'
import uploadService from './upload.service'
import type { PlaceFilterParams, PlaceCreateParams, PlaceUpdateParams } from '@/types/place'

/**
 * Enterprise Admin Places API Service
 * Thin Axios wrappers around FastAPI /places and /uploads endpoints
 */
export const adminPlacesApi = {
  list: (params?: PlaceFilterParams) => placesService.getPlaces(params),
  getById: (uuid: string) => placesService.getPlaceByUuid(uuid),
  getBySlug: (slug: string) => placesService.getPlaceBySlug(slug),
  create: (data: PlaceCreateParams) => placesService.createPlace(data),
  update: (uuid: string, data: PlaceUpdateParams) => placesService.updatePlace(uuid, data),
  delete: (uuid: string) => placesService.deletePlace(uuid),
  publish: (uuid: string) => placesService.publishPlace(uuid),
  archive: (uuid: string) => placesService.archivePlace(uuid),
  uploadImage: uploadService.uploadImage,
}

export default adminPlacesApi
