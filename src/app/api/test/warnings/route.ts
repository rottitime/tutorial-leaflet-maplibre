import { WarningLevel, WarningPoint } from '@/types'
import { NextResponse } from 'next/server'

const WARNING_DEFAULT_COUNT = 400
const WARNING_DEFAULT_SEED = 23
const MAX_SIZE = 100_000
const UK = { south: 49.85, north: 60.9, west: -8.2, east: 1.85 }

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

function pickLevel(rnd: () => number): WarningLevel {
  return rnd() < 0.45 ? 'high' : 'medium'
}

function createWarnings(count: number, seed?: number): WarningPoint[] {
  const rnd = seed === undefined ? Math.random : mulberry32(seed >>> 0)
  const points: WarningPoint[] = []

  for (let i = 0; i < count; i++) {
    const level = pickLevel(rnd)
    points.push({
      id: `warning-${i}`,
      position: [
        UK.south + rnd() * (UK.north - UK.south),
        UK.west + rnd() * (UK.east - UK.west),
      ],
      level,
      glowRadius: level === 'high' ? 20 + rnd() * 24 : 16 + rnd() * 20,
      glowOpacity: level === 'high' ? 0.22 + rnd() * 0.2 : 0.14 + rnd() * 0.18,
    })
  }

  return points
}

/** GET /api/test/warnings?size=150&seed=23 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = toPositiveInt(searchParams.get('size'), WARNING_DEFAULT_COUNT)
  const seedRaw = searchParams.get('seed')
  const seed =
    seedRaw === null
      ? WARNING_DEFAULT_SEED
      : toPositiveInt(seedRaw, WARNING_DEFAULT_SEED)

  return NextResponse.json(createWarnings(size, seed), {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
