import { NextResponse } from 'next/server'

const GARAGE_FLOOD_COUNT = 300
const GARAGE_DUMP_SEED = 42
const MAX_SIZE = 100_000

function toPositiveInt(input: string | null, fallback: number) {
  if (input === null) return fallback
  const n = Number.parseInt(input, 10)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(n, MAX_SIZE)
}

/**
 * GET /api/test/garages
 * - `size`: garage count (1..100000)
 * - `seed`: optional deterministic seed; omit for random output per request
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = toPositiveInt(searchParams.get('size'), GARAGE_FLOOD_COUNT)
  const seedRaw = searchParams.get('seed')
  const seed =
    seedRaw === null
      ? GARAGE_DUMP_SEED
      : toPositiveInt(seedRaw, GARAGE_DUMP_SEED)

  const data = createRandomGarageFeatureCollection(size, seed)

  return NextResponse.json(data, {
    headers: {
      'Content-Type': 'application/geo+json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

/**
 * GeoJSON Point uses [lng, lat]. Same object can feed MapLibre
 * (`addSource({ type: 'geojson', data })`) and Leaflet (`L.geoJSON` / react-leaflet GeoJSON).
 */

type GarageFeature = {
  type: 'Feature'
  properties: {
    id: string
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

type GarageFeatureCollection = {
  type: 'FeatureCollection'
  features: GarageFeature[]
}

/** Rough bounds for GB + NI — demo / perf data only. */
const UK_GARAGE_BOUNDS = {
  south: 49.85,
  north: 60.9,
  west: -8.2,
  east: 1.85,
} as const

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createRandomGarageFeatureCollection(
  count: number = GARAGE_FLOOD_COUNT,
  seed?: number,
): GarageFeatureCollection {
  const { south, north, west, east } = UK_GARAGE_BOUNDS
  const features: GarageFeature[] = []
  const rnd = seed === undefined ? Math.random : mulberry32(seed >>> 0)
  for (let i = 0; i < count; i++) {
    const lng = west + rnd() * (east - west)
    const lat = south + rnd() * (north - south)
    features.push({
      type: 'Feature',
      properties: { id: `garage-${i}` },
      geometry: { type: 'Point', coordinates: [lng, lat] },
    })
  }
  return { type: 'FeatureCollection', features }
}
