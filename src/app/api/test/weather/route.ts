import { WeatherKind, WeatherPatch } from '@/types'
import { NextResponse } from 'next/server'

const PATCH_COUNT = 400
const UK = { south: 49.85, north: 60.9, west: -8.2, east: 1.85 }

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function pickKind(): WeatherKind {
  const u = Math.random()
  if (u < 0.34) return 'hot'
  if (u < 0.68) return 'cold'
  return 'rain'
}

function buildPatches(n: number): WeatherPatch[] {
  const { south, north, west, east } = UK
  return Array.from({ length: n }, (_, id) => {
    const kind = pickKind()
    const radius =
      kind === 'rain' ? rnd(38, 95) : kind === 'hot' ? rnd(22, 62) : rnd(24, 68)

    return {
      id,
      center: [rnd(south, north), rnd(west, east)] as [number, number],
      radius,
      kind,
    }
  })
}

/** GET /api/test/weather */
export async function GET() {
  return NextResponse.json(buildPatches(PATCH_COUNT), {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
