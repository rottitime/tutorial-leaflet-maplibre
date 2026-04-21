import { createWarnings, toPositiveInt } from '@/lib/testData'
import { NextResponse } from 'next/server'

const WARNING_DEFAULT_COUNT = 400
const WARNING_DEFAULT_SEED = 23

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
