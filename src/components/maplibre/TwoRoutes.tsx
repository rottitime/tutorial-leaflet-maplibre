'use client'

import { useMap } from '@/context/MapContext'
import type { FeatureCollection, LineString } from 'geojson'
import { useEffect } from 'react'
import {
  addLayerIfMissing,
  addSourceIfMissing,
  runWhenStyleReady,
} from './map-helper'

const SOURCE_ID = 'two-routes'
const LAYER_ID = 'two-routes-line'

const ROUTES: FeatureCollection<LineString, { color: string; dashed?: boolean }> = {
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

export function TwoRoutes() {
  const { mapRef, ready } = useMap()

  useEffect(() => {
    const map = ready ? mapRef.current : null
    if (!map) return

    return runWhenStyleReady(map, () => {
      addSourceIfMissing(map, SOURCE_ID, { type: 'geojson', data: ROUTES })
      addLayerIfMissing(map, {
        id: LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-dasharray': [
            'case',
            ['boolean', ['get', 'dashed'], false],
            ['literal', [1, 1.6]],
            ['literal', [1, 0]],
          ],
        },
      })
    })
  }, [mapRef, ready])

  return null
}
