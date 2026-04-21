import { createPointCollection, toPositiveInt } from '@/lib/testData'
import { NextResponse } from 'next/server'

const CAFE_DEFAULT_COUNT = 700
const CAFE_DEFAULT_SEED = 17

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = toPositiveInt(searchParams.get('size'), CAFE_DEFAULT_COUNT)
  const seedRaw = searchParams.get('seed')
  const seed =
    seedRaw === null ? CAFE_DEFAULT_SEED : toPositiveInt(seedRaw, CAFE_DEFAULT_SEED)

  return NextResponse.json(createPointCollection('cafe', size, seed), {
    headers: {
      'Content-Type': 'application/geo+json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
