'use client'

import { FerryRoute } from '@/types'
import { ensureLayer, upsertGeoJsonSource } from './mapClientUtils'
import { Map } from 'maplibre-gl'

const BASE_SOURCE_ID = 'ferry-base-source'
const ANIM_SOURCE_ID = 'ferry-anim-source'
const BASE_LAYER_ID = 'ferry-base-layer'
const ANIM_LAYER_ID = 'ferry-anim-layer'

function toCoords(path: [number, number][]) {
  return path.map((p) => [p[1], p[0]])
}

export function syncFerryLayer(map: Map, route: FerryRoute | null, animatedPath: [number, number][]) {
  if (!route) return

  upsertGeoJsonSource(map, BASE_SOURCE_ID, {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: toCoords(route.path) },
  })

  upsertGeoJsonSource(map, ANIM_SOURCE_ID, {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: toCoords(animatedPath) },
  })

  ensureLayer(map, {
    id: BASE_LAYER_ID,
    type: 'line',
    source: BASE_SOURCE_ID,
    paint: { 'line-color': '#334155', 'line-width': 2, 'line-opacity': 0.25 },
  })

  ensureLayer(map, {
    id: ANIM_LAYER_ID,
    type: 'line',
    source: ANIM_SOURCE_ID,
    paint: { 'line-color': '#2563eb', 'line-width': 3, 'line-opacity': 0.9 },
  })
}
