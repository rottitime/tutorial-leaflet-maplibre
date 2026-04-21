import { FerryRoute } from '@/types'
import { NextResponse } from 'next/server'

const ferryRoute: FerryRoute = {
  name: 'Portsmouth to Cherbourg',
  from: {
    name: 'Portsmouth',
    position: [50.8198, -1.088] as [number, number],
  },
  to: {
    name: 'Cherbourg',
    position: [49.6337, -1.6221] as [number, number],
  },
  path: [
    [50.8198, -1.088],
    [50.6, -1.3],
    [50.2, -1.5],
    [49.9, -1.6],
    [49.6337, -1.6221],
  ] as [number, number][],
}

/** GET /api/test/ferries */
export async function GET() {
  return NextResponse.json(ferryRoute, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
