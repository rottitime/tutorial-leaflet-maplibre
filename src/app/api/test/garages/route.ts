import { createPointCollection, toPositiveInt } from '@/lib/testData'
import { NextResponse } from 'next/server'

const GARAGE_FLOOD_COUNT = 300
const GARAGE_DUMP_SEED = 42

/** GET /api/test/garages */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = toPositiveInt(searchParams.get('size'), GARAGE_FLOOD_COUNT)
  const seedRaw = searchParams.get('seed')
  const seed =
    seedRaw === null
      ? GARAGE_DUMP_SEED
      : toPositiveInt(seedRaw, GARAGE_DUMP_SEED)

  return NextResponse.json(createPointCollection('garage', size, seed), {
    headers: {
      'Content-Type': 'application/geo+json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
