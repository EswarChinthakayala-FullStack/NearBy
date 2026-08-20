export interface RouteStep {
  instruction: string
  distance_meters: number
  duration_seconds: number
}

export interface RouteResponse {
  distance_km: number
  duration_mins: number
  polyline?: string
  steps?: RouteStep[]
}
