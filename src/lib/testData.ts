import {
  PointFeatureCollection,
  WarningLevel,
  WarningPoint,
  WeatherKind,
  WeatherPatch,
} from '@/types'

export const MAX_SIZE = 100_000
export const UK_BOUNDS = { south: 49.85, north: 60.9, west: -8.2, east: 1.85 } as const

export function toPositiveInt(input: string | null, fallback: number) {
  if (input === null) return fallback
  const n = Number.parseInt(input, 10)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(n, MAX_SIZE)
}

export function seededRandom(seed?: number) {
  if (seed === undefined) return Math.random
  let s = seed >>> 0
  return () => {
    let t = (s += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomLngLat(rnd: () => number): [number, number] {
  const lng = UK_BOUNDS.west + rnd() * (UK_BOUNDS.east - UK_BOUNDS.west)
  const lat = UK_BOUNDS.south + rnd() * (UK_BOUNDS.north - UK_BOUNDS.south)
  return [lng, lat]
}

export function randomLatLng(rnd: () => number): [number, number] {
  const [lng, lat] = randomLngLat(rnd)
  return [lat, lng]
}

export function createPointCollection(
  prefix: string,
  count: number,
  seed?: number,
): PointFeatureCollection {
  const rnd = seededRandom(seed)
  const features = Array.from({ length: count }, (_, i) => ({
    type: 'Feature' as const,
    properties: { id: `${prefix}-${i}` },
    geometry: { type: 'Point' as const, coordinates: randomLngLat(rnd) },
  }))
  return { type: 'FeatureCollection', features }
}

export function createWeatherPatches(count: number, seed?: number): WeatherPatch[] {
  const rnd = seededRandom(seed)
  const pickKind = (): WeatherKind => {
    const u = rnd()
    if (u < 0.34) return 'hot'
    if (u < 0.68) return 'cold'
    return 'rain'
  }

  return Array.from({ length: count }, (_, id) => {
    const kind = pickKind()
    const [lat, lng] = randomLatLng(rnd)
    const radius =
      kind === 'rain' ? 38 + rnd() * 57 : kind === 'hot' ? 22 + rnd() * 40 : 24 + rnd() * 44
    return { id, center: [lat, lng] as [number, number], radius, kind }
  })
}

export function createWarnings(count: number, seed?: number): WarningPoint[] {
  const rnd = seededRandom(seed)
  const pickLevel = (): WarningLevel => (rnd() < 0.45 ? 'high' : 'medium')

  return Array.from({ length: count }, (_, i) => {
    const level = pickLevel()
    const [lat, lng] = randomLatLng(rnd)
    return {
      id: `warning-${i}`,
      position: [lat, lng],
      level,
      glowRadius: level === 'high' ? 20 + rnd() * 24 : 16 + rnd() * 20,
      glowOpacity: level === 'high' ? 0.22 + rnd() * 0.2 : 0.14 + rnd() * 0.18,
    }
  })
}
