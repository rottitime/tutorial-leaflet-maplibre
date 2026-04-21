'use client'

import { WeatherPatch } from '@/types'
import { ensureLayer, upsertGeoJsonSource } from './mapClientUtils'
import { FeatureCollection, Point } from 'geojson'
import { Map } from 'maplibre-gl'

const SOURCE_ID = 'weather-source'
const CIRCLE_LAYER_ID = 'weather-circles'

const colors: Record<WeatherPatch['kind'], string> = {
  hot: '#f97316',
  cold: '#38bdf8',
  rain: '#d1d5db',
}

export function syncWeatherLayer(map: Map, patches: WeatherPatch[]) {
  const data: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: patches.map((p) => ({
      type: 'Feature',
      properties: {
        radius: p.radius,
        color: colors[p.kind],
        opacity: p.kind === 'rain' ? 0.48 : p.kind === 'hot' ? 0.4 : 0.38,
      },
      geometry: { type: 'Point', coordinates: [p.center[1], p.center[0]] },
    })),
  }

  upsertGeoJsonSource(map, SOURCE_ID, data)

  ensureLayer(map, {
    id: CIRCLE_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-color': ['get', 'color'],
      'circle-opacity': ['get', 'opacity'],
      'circle-radius': ['get', 'radius'],
      'circle-stroke-width': 0,
    },
  })
}
