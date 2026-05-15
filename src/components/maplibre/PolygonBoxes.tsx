'use client'

import { useMap } from '@/context/MapContext'
import { parityConfig } from '@/lib/parityConfig'
import type { FeatureCollection, Polygon } from 'geojson'
import { useEffect, useState } from 'react'
import {
  addLayerIfMissing,
  addSourceIfMissing,
  runWhenStyleReady,
} from './map-helper'
import { ROUTE_SOLID_LAYER_ID } from './layerIds'

const POLYGON_SOURCE_ID = 'polygon-boxes'
const POLYGON_FILL_LAYER_ID = 'polygon-boxes-fill'
const POLYGON_OUTLINE_LAYER_ID = 'polygon-boxes-outline'
type PolygonProps = { name: string; color: string }
type PolygonCollection = FeatureCollection<Polygon, PolygonProps>

export function PolygonBoxes() {
  const { mapRef, ready } = useMap()
  const [polygonData, setPolygonData] = useState<PolygonCollection | null>(null)

  useEffect(() => {
    let active = true

    fetch(parityConfig.fetch.polygonBoxes)
      .then((r) => r.json() as Promise<PolygonCollection>)
      .then((data) => {
        if (active) setPolygonData(data)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const map = ready ? mapRef.current : null
    if (!map || !polygonData) return

    const syncPolygons = () => {
      addSourceIfMissing(map, POLYGON_SOURCE_ID, {
        type: 'geojson',
        data: polygonData,
      })
      addLayerIfMissing(
        map,
        {
          id: POLYGON_FILL_LAYER_ID,
          type: 'fill',
          source: POLYGON_SOURCE_ID,
          paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.55 },
        },
        ROUTE_SOLID_LAYER_ID,
      )
      addLayerIfMissing(
        map,
        {
          id: POLYGON_OUTLINE_LAYER_ID,
          type: 'line',
          source: POLYGON_SOURCE_ID,
          paint: { 'line-color': '#1f2937', 'line-width': 2 },
        },
        ROUTE_SOLID_LAYER_ID,
      )
    }

    const cleanupReady = runWhenStyleReady(map, syncPolygons)

    const onStyleData = () => {
      if (!map.isStyleLoaded()) return
      syncPolygons()
    }
    map.on('styledata', onStyleData)

    return () => {
      cleanupReady()
      map.off('styledata', onStyleData)
    }
  }, [mapRef, ready, polygonData])

  return null
}
