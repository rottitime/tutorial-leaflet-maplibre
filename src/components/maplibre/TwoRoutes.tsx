'use client'

import { useMap } from '@/context/MapContext'
import type { FeatureCollection, LineString, Point } from 'geojson'
import { Map } from 'maplibre-gl'
import { useEffect } from 'react'
import { addLayerIfMissing, runWhenStyleReady } from './map-helper'
import { upsertGeoJsonSource } from './mapClientUtils'

const ROUTE1_POINTS: [number, number][] = [
  [-0.1276, 51.5072], // London
  [-1.8904, 52.4862], // Birmingham
  [-2.2426, 53.4808], // Manchester
  [-1.5491, 53.8008], // Leeds
  [-3.1883, 55.9533], // Edinburgh
]

const ROUTE2_POINTS: [number, number][] = [
  [-4.2518, 55.8642], // Glasgow
  [-2.5879, 51.4545], // Bristol
  [-0.1276, 51.5072], // London
  [1.2974, 52.6309], // Norwich
]

const ROUTE1_LINE_SOURCE_ID = 'uk-route-1-line-source'
const ROUTE2_LINE_SOURCE_ID = 'uk-route-2-line-source'
const ROUTE1_POINT_SOURCE_ID = 'uk-route-1-point-source'
const ROUTE2_POINT_SOURCE_ID = 'uk-route-2-point-source'
const ROUTE1_LINE_LAYER_ID = 'uk-route-1-line-layer'
const ROUTE2_LINE_LAYER_ID = 'uk-route-2-line-layer'
const ROUTE1_POINT_LAYER_ID = 'uk-route-1-point-layer'
const ROUTE2_POINT_LAYER_ID = 'uk-route-2-point-layer'

function buildLineData(points: [number, number][]): FeatureCollection<LineString> {
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

function buildPointData(points: [number, number][]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: points.map(([lng, lat]) => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [lng, lat] },
    })),
  }
}

function syncRoutes(map: Map) {
  upsertGeoJsonSource(map, ROUTE1_LINE_SOURCE_ID, buildLineData(ROUTE1_POINTS))
  upsertGeoJsonSource(map, ROUTE2_LINE_SOURCE_ID, buildLineData(ROUTE2_POINTS))
  upsertGeoJsonSource(map, ROUTE1_POINT_SOURCE_ID, buildPointData(ROUTE1_POINTS))
  upsertGeoJsonSource(map, ROUTE2_POINT_SOURCE_ID, buildPointData(ROUTE2_POINTS))

  addLayerIfMissing(map, {
    id: ROUTE1_LINE_LAYER_ID,
    type: 'line',
    source: ROUTE1_LINE_SOURCE_ID,
    minzoom: 0,
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#2563eb',
      'line-width': 6,
    },
  })

  addLayerIfMissing(map, {
    id: ROUTE2_LINE_LAYER_ID,
    type: 'line',
    source: ROUTE2_LINE_SOURCE_ID,
    minzoom: 0,
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#2563eb',
      'line-width': 6,
      'line-dasharray': [1, 1.6],
    },
  })

  addLayerIfMissing(map, {
    id: ROUTE1_POINT_LAYER_ID,
    type: 'circle',
    source: ROUTE1_POINT_SOURCE_ID,
    minzoom: 0,
    paint: {
      'circle-color': '#2563eb',
      'circle-radius': 10,
    },
  })

  addLayerIfMissing(map, {
    id: ROUTE2_POINT_LAYER_ID,
    type: 'circle',
    source: ROUTE2_POINT_SOURCE_ID,
    minzoom: 0,
    paint: {
      'circle-color': '#2563eb',
      'circle-radius': 10,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
    },
  })

  if (map.getLayer(ROUTE1_LINE_LAYER_ID)) map.moveLayer(ROUTE1_LINE_LAYER_ID)
  if (map.getLayer(ROUTE2_LINE_LAYER_ID)) map.moveLayer(ROUTE2_LINE_LAYER_ID)
  if (map.getLayer(ROUTE1_POINT_LAYER_ID)) map.moveLayer(ROUTE1_POINT_LAYER_ID)
  if (map.getLayer(ROUTE2_POINT_LAYER_ID)) map.moveLayer(ROUTE2_POINT_LAYER_ID)
}

export function TwoRoutes() {
  const { mapRef, ready } = useMap()

  useEffect(() => {
    const map = ready ? mapRef.current : null
    if (!map) return

    const cleanupReady = runWhenStyleReady(map, () => syncRoutes(map))

    const onStyleData = () => {
      if (!map.isStyleLoaded()) return
      syncRoutes(map)
    }
    const onIdle = () => {
      if (!map.isStyleLoaded()) return
      syncRoutes(map)
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
