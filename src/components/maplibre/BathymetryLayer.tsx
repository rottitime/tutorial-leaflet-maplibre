'use client'

import { useMap } from '@/context/MapContext'
import { parityConfig } from '@/lib/parityConfig'
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { useEffect, useState } from 'react'
import { addLayerIfMissing, addSourceIfMissing } from './map-helper'

type Bathymetry = FeatureCollection<Polygon | MultiPolygon, { depth_m: number }>

const SHELF_SOURCE = 'bathymetry-200m'
const SHELF_LAYER = 'bathymetry-200m-fill'

const DEEP_SOURCE = 'bathymetry-1000m'
const DEEP_LAYER = 'bathymetry-1000m-fill'

export function BathymetryLayer() {
  const { mapRef, ready } = useMap()
  const [shelf, setShelf] = useState<Bathymetry | null>(null)
  const [deep, setDeep] = useState<Bathymetry | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      const [s, d] = await Promise.all([
        fetch(parityConfig.fetch.bathymetry200m).then((r) => r.json()),
        fetch(parityConfig.fetch.bathymetry1000m).then((r) => r.json()),
      ])
      if (!active) return
      setShelf(s)
      setDeep(d)
    }
    load().catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const map = ready ? mapRef.current : null
    if (!map || !shelf || !deep) return

    // Shallow band (>200 m): light blue
    addSourceIfMissing(map, SHELF_SOURCE, { type: 'geojson', data: shelf })
    addLayerIfMissing(map, {
      id: SHELF_LAYER,
      type: 'fill',
      source: SHELF_SOURCE,
      paint: {
        'fill-color': '#60a5fa',
        'fill-opacity': 0.45,
        'fill-outline-color': '#1d4ed8',
      },
    })

    // Deep band (>1000 m): darker blue, drawn on top
    addSourceIfMissing(map, DEEP_SOURCE, { type: 'geojson', data: deep })
    addLayerIfMissing(map, {
      id: DEEP_LAYER,
      type: 'fill',
      source: DEEP_SOURCE,
      paint: {
        'fill-color': '#1e3a8a',
        'fill-opacity': 0.55,
        'fill-outline-color': '#0c1d52',
      },
    })

    map.fitBounds(
      [
        [-15, 48],
        [5, 62],
      ],
      { padding: 40, duration: 800 },
    )
  }, [mapRef, ready, shelf, deep])

  return null
}
