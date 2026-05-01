'use client'

import { useMap } from '@/context/MapContext'
import type { FeatureCollection, Polygon } from 'geojson'
import maplibregl from 'maplibre-gl'
import { useEffect } from 'react'
import { runWhenStyleReady } from './map-helper'

const POLYGON_SOURCE_ID = 'polygon-boxes'
const POLYGON_FILL_LAYER_ID = 'polygon-boxes-fill'
const POLYGON_OUTLINE_LAYER_ID = 'polygon-boxes-outline'

const POLYGON_DATA: FeatureCollection<
  Polygon,
  { name: string; color: string }
> = {
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
          ],
        ],
      },
    },
  ],
}

export function PolygonBoxes() {
  const { mapRef, ready } = useMap()

  useEffect(() => {
    const map = ready ? mapRef.current : null
    if (!map) return

    return runWhenStyleReady(map, () => {
      const existingSource = map.getSource(POLYGON_SOURCE_ID)
      if (existingSource) {
        ;(existingSource as maplibregl.GeoJSONSource).setData(POLYGON_DATA)
      } else {
        map.addSource(POLYGON_SOURCE_ID, {
          type: 'geojson',
          data: POLYGON_DATA,
        })
      }

      if (!map.getLayer(POLYGON_FILL_LAYER_ID)) {
        map.addLayer({
          id: POLYGON_FILL_LAYER_ID,
          type: 'fill',
          source: POLYGON_SOURCE_ID,
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.55,
          },
        })
      }

      if (!map.getLayer(POLYGON_OUTLINE_LAYER_ID)) {
        map.addLayer({
          id: POLYGON_OUTLINE_LAYER_ID,
          type: 'line',
          source: POLYGON_SOURCE_ID,
          paint: {
            'line-color': '#1f2937',
            'line-width': 2,
          },
        })
      }
    })
  }, [mapRef, ready])

  return null
}
