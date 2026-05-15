import type { FeatureCollection, Polygon } from 'geojson'
import { NextResponse } from 'next/server'

type PolygonProps = { name: string; color: string }

const polygonBoxes: FeatureCollection<Polygon, PolygonProps> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Polygon A', color: '#088' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-101, 40],
            [-99, 40],
            [-99, 38],
            [-101, 38],
            [-101, 40],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Polygon B', color: '#e76f51' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-9.3, 60.3],
            [-7, 61],
            [-4.7, 59.7],
            [-7, 59],
            [-9.3, 60.3],
          ],
        ],
      },
    },
  ],
}

/** GET /api/test/polygon-boxes */
export async function GET() {
  return NextResponse.json(polygonBoxes, {
    headers: {
      'Content-Type': 'application/geo+json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
