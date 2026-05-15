'use client'

import { useMap } from '@/context/MapContext'
import { parityConfig } from '@/lib/parityConfig'
import type { FeatureCollection, LineString, Point } from 'geojson'
import { useEffect, useState } from 'react'
import {
  ROUTE_DASHED_LAYER_ID,
  ROUTE_POINT_LAYER_ID,
  ROUTE_SOLID_LAYER_ID,
} from './layerIds'
import {
  addLayerIfMissing,
  addSourceIfMissing,
  runWhenStyleReady,
} from './map-helper'

const SOURCE_ID = 'two-routes'
const POINT_SOURCE_ID = 'two-routes-points'

type RouteProps = { color: string; dashed?: boolean }
type RouteCollection = FeatureCollection<LineString, RouteProps>

function toPointCollection(
  routes: RouteCollection,
): FeatureCollection<Point, { dashed?: boolean }> {
  return {
    type: 'FeatureCollection',
    features: routes.features.flatMap((feature) =>
      feature.geometry.coordinates.map((coord) => ({
        type: 'Feature' as const,
        properties: { dashed: feature.properties.dashed },
        geometry: { type: 'Point' as const, coordinates: coord },
      })),
    ),
  }
}

export function TwoRoutes() {
  const { mapRef, ready } = useMap()
  const [routes, setRoutes] = useState<RouteCollection | null>(null)

  useEffect(() => {
    let active = true

    fetch(parityConfig.fetch.twoRoutes)
      .then((r) => r.json() as Promise<RouteCollection>)
      .then((data) => {
        if (active) setRoutes(data)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const map = ready ? mapRef.current : null
    if (!map || !routes) return

    const points = toPointCollection(routes)

    const bringRoutesToFront = () => {
      if (map.getLayer(ROUTE_SOLID_LAYER_ID))
        map.moveLayer(ROUTE_SOLID_LAYER_ID)
      if (map.getLayer(ROUTE_DASHED_LAYER_ID))
        map.moveLayer(ROUTE_DASHED_LAYER_ID)
      if (map.getLayer(ROUTE_POINT_LAYER_ID))
        map.moveLayer(ROUTE_POINT_LAYER_ID)
    }

    const cleanupReady = runWhenStyleReady(map, () => {
      console.log('routes', { routes })
      addSourceIfMissing(map, SOURCE_ID, { type: 'geojson', data: routes })
      addSourceIfMissing(map, POINT_SOURCE_ID, {
        type: 'geojson',
        data: points,
      })

      addLayerIfMissing(map, {
        id: ROUTE_SOLID_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        filter: ['!=', ['get', 'dashed'], true],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
        },
      })

      addLayerIfMissing(map, {
        id: ROUTE_DASHED_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        filter: ['==', ['get', 'dashed'], true],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-dasharray': [1, 1.6],
        },
      })

      addLayerIfMissing(map, {
        id: ROUTE_POINT_LAYER_ID,
        type: 'circle',
        source: POINT_SOURCE_ID,
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'case',
            ['boolean', ['get', 'dashed'], false],
            '#ffffff',
            '#2563eb',
          ],
          'circle-stroke-color': '#2563eb',
          'circle-stroke-width': [
            'case',
            ['boolean', ['get', 'dashed'], false],
            3,
            0,
          ],
        },
      })

      bringRoutesToFront()
    })

    map.on('styledata', bringRoutesToFront)
    map.on('idle', bringRoutesToFront)

    return () => {
      cleanupReady()
      map.off('styledata', bringRoutesToFront)
      map.off('idle', bringRoutesToFront)
    }
  }, [mapRef, ready, routes])

  return null
}
