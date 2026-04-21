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

export type WeatherKind = 'hot' | 'cold' | 'rain'

export type WeatherPatch = {
  id: number
  center: [number, number]
  radius: number
  kind: WeatherKind
}
