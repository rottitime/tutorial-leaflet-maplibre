'use client'

import { useMap } from '@/context/MapContext'
import type { FeatureCollection, LineString, Point } from 'geojson'
import { Map } from 'maplibre-gl'
import { useEffect } from 'react'
import { addLayerIfMissing, runWhenStyleReady } from './map-helper'
import { upsertGeoJsonSource } from './mapClientUtils'

type Coord = [number, number]

type Route = {
  id: string
  points: Coord[]
  dashed?: boolean
  pointStroke?: boolean
}

const ROUTE_COLOR = '#2563eb'

const ROUTES: Route[] = [
  {
    id: 'uk-route-1',
    points: [
      [-0.1276, 51.5072], // London
      [-1.8904, 52.4862], // Birmingham
      [-2.2426, 53.4808], // Manchester
      [-1.5491, 53.8008], // Leeds
      [-3.1883, 55.9533], // Edinburgh
    ],
  },
  {
    id: 'uk-route-2',
    dashed: true,
    pointStroke: true,
    points: [
      [-4.2518, 55.8642], // Glasgow
      [-2.5879, 51.4545], // Bristol
      [-0.1276, 51.5072], // London
      [1.2974, 52.6309], // Norwich
    ],
  },
]

function buildLineData(points: Coord[]): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: points },
      },
    ],
  }
}

function buildPointData(points: Coord[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((coord) => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: coord },
    })),
  }
}

function syncRoute(map: Map, route: Route) {
  const lineSourceId = `${route.id}-line-source`
  const pointSourceId = `${route.id}-point-source`
  const lineLayerId = `${route.id}-line-layer`
  const pointLayerId = `${route.id}-point-layer`

  addLayerIfMissing(map, {
    id: lineLayerId,
    type: 'line',
    source: lineSourceId,
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': ROUTE_COLOR,
      'line-width': 6,
      ...(route.dashed ? { 'line-dasharray': [1, 1.6] } : {}),
    },
  })

  addLayerIfMissing(map, {
    id: pointLayerId,
    type: 'circle',
    source: pointSourceId,
    paint: {
      'circle-color': ROUTE_COLOR,
      'circle-radius': 10,
      ...(route.pointStroke
        ? { 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 }
        : {}),
    },
  })
}

function moveLayerIfPresent(map: Map, layerId: string) {
  if (map.getLayer(layerId)) map.moveLayer(layerId)
}

function syncRoutes(map: Map) {
  for (const route of ROUTES) {
    const lineSourceId = `${route.id}-line-source`
    const pointSourceId = `${route.id}-point-source`
    const lineLayerId = `${route.id}-line-layer`
    const pointLayerId = `${route.id}-point-layer`

    upsertGeoJsonSource(map, lineSourceId, buildLineData(route.points))
    upsertGeoJsonSource(map, pointSourceId, buildPointData(route.points))
    syncRoute(map, route)

    // Keep routes visible if other components add layers after us.
    moveLayerIfPresent(map, lineLayerId)
    moveLayerIfPresent(map, pointLayerId)
  }
}

export function TwoRoutes() {
  const { mapRef, ready } = useMap()

  useEffect(() => {
    const map = ready ? mapRef.current : null
    if (!map) return

    const cleanupReady = runWhenStyleReady(map, () => syncRoutes(map))

    const onStyleData = () => {
      if (map.isStyleLoaded()) syncRoutes(map)
    }
    const onIdle = () => {
      if (map.isStyleLoaded()) syncRoutes(map)
    }
    map.on('styledata', onStyleData)
    map.on('idle', onIdle)

    return () => {
      cleanupReady()
      map.off('styledata', onStyleData)
      map.off('idle', onIdle)
    }
  }, [mapRef, ready])

  return null
}
