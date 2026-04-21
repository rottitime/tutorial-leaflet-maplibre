export type FerryRoute = {
  name: string
  from: {
    name: string
    position: [number, number]
  }
  to: {
    name: string
    position: [number, number]
  }
  path: [number, number][]
}

export type LatLng = [number, number]
export type LngLat = [number, number]

export type PointFeature = {
  type: 'Feature'
  properties: { id: string }
  geometry: { type: 'Point'; coordinates: LngLat }
}

export type PointFeatureCollection = {
  type: 'FeatureCollection'
  features: PointFeature[]
}

export type WeatherKind = 'hot' | 'cold' | 'rain'

export type WeatherPatch = {
  id: number
  center: [number, number]
  radius: number
  kind: WeatherKind
}

export type WarningLevel = 'high' | 'medium'

export type WarningPoint = {
  id: string
  position: [number, number]
  level: WarningLevel
  glowRadius: number
  glowOpacity: number
}
