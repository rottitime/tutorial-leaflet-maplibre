import { NextResponse } from 'next/server'

const CAFE_DEFAULT_COUNT = 120
const CAFE_DEFAULT_SEED = 17
const MAX_SIZE = 100_000
const UK = { south: 49.85, north: 60.9, west: -8.2, east: 1.85 }

type CafeFeature = {
  type: 'Feature'
  properties: { id: string }
  geometry: { type: 'Point'; coordinates: [number, number] }
}

type CafeFeatureCollection = {
  type: 'FeatureCollection'
  features: CafeFeature[]
}

function toPositiveInt(input: string | null, fallback: number) {
  if (input === null) return fallback
  const n = Number.parseInt(input, 10)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(n, MAX_SIZE)
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createCafes(count: number, seed?: number): CafeFeatureCollection {
  const rnd = seed === undefined ? Math.random : mulberry32(seed >>> 0)
  const features: CafeFeature[] = []
  for (let i = 0; i < count; i++) {
    const lng = UK.west + rnd() * (UK.east - UK.west)
    const lat = UK.south + rnd() * (UK.north - UK.south)
    features.push({
      type: 'Feature',
      properties: { id: `cafe-${i}` },
      geometry: { type: 'Point', coordinates: [lng, lat] },
    })
  }
  return { type: 'FeatureCollection', features }
}

/** GET /api/test/cafes?size=120&seed=17 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = toPositiveInt(searchParams.get('size'), CAFE_DEFAULT_COUNT)
  const seedRaw = searchParams.get('seed')
  const seed =
    seedRaw === null ? CAFE_DEFAULT_SEED : toPositiveInt(seedRaw, CAFE_DEFAULT_SEED)

  return NextResponse.json(createCafes(size, seed), {
    headers: {
      'Content-Type': 'application/geo+json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
