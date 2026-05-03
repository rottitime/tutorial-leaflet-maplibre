import type { FeatureCollection, LineString } from 'geojson'
import { NextResponse } from 'next/server'

type RouteProps = { color: string; dashed?: boolean }

const twoRoutes: FeatureCollection<LineString, RouteProps> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { color: '#2563eb' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-0.1276, 51.5072], // London
          [-2.2426, 53.4808], // Manchester
          [-3.1883, 55.9533], // Edinburgh
        ],
      },
    },
    {
      type: 'Feature',
      properties: { color: '#e11d48', dashed: true },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-4.2518, 55.8642], // Glasgow
          [-2.5879, 51.4545], // Bristol
          [1.2974, 52.6309], // Norwich
        ],
      },
    },
  ],
}

/** GET /api/test/two-routes */
export async function GET() {
  return NextResponse.json(twoRoutes, {
    headers: {
      'Content-Type': 'application/geo+json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
