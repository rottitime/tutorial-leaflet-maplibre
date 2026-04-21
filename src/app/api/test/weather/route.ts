import { createWeatherPatches } from '@/lib/testData'
import { NextResponse } from 'next/server'

const PATCH_COUNT = 400

/** GET /api/test/weather */
export async function GET() {
  return NextResponse.json(createWeatherPatches(PATCH_COUNT), {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
